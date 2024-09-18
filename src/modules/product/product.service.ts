import { ProductQnAAuthorType, ProductType } from '@prisma/client';
import { DateTime } from 'luxon';

import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { PrismaService } from 'src/common/modules/prisma/prisma.service';
import { S3Service } from 'src/common/modules/s3/s3.service';

import { BlockchainService } from '../blockchain/blockchain.service';
import { CreateProductDTO } from './dto/create.product.dto';
import { CreateProductQnADTO } from './dto/create.qna.dto';
import { GetProductDTO, GetProductsDTO } from './dto/get.product.dto';

@Injectable()
export class ProductService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly blockchainService: BlockchainService,
    private readonly s3Service: S3Service,
    private readonly configService: ConfigService<{
      S3_PUBLIC_URL: string;
    }>,
  ) {}

  async createProduct(userId: string, dto: CreateProductDTO) {
    const product = await this.prisma.product.create({
      data: {
        name: dto.name,
        image: `${this.configService.get('S3_PUBLIC_URL')}/cover.png`,
        detailImage: '상세 이미지 URL',
        currentAmount: dto.currentAmount,
        targetAmount: dto.targetAmount,
        fundingEndDate: DateTime.fromISO(dto.fundingEndDate).toJSDate(),
        user: {
          connect: {
            id: userId,
          },
        },
        categories: {
          create: dto.category.map((category) => ({
            category: {
              connectOrCreate: {
                where: {
                  name: category,
                },
                create: {
                  name: category,
                },
              },
            },
          })),
        },
      },
    });

    // connect s3
    const address = await this.blockchainService.create(
      dto.name,
      product.id,
      `${this.configService.get('S3_PUBLIC_URL')}/${product.id}/1.png`,
    );

    await this.prisma.product.update({
      where: {
        id: product.id,
      },
      data: {
        tokenAddress: address,
      },
    });

    return product;
  }

  async uploadProductImage(userId: string, productId: string, base64Image: string) {
    const product = await this.prisma.product.findUnique({
      where: {
        id: productId,
      },
    });

    if (!product) throw new NotFoundException('상품을 찾을 수 없습니다.');
    if (product.ownerId !== userId) throw new BadRequestException('상품 소유자가 아닙니다.');

    // connect s3
    const key = `${product.id}/1.png`;

    const url = await this.s3Service.uploadImage(key, base64Image);

    return this.prisma.product.update({
      where: {
        id: productId,
      },
      data: {
        image: url,
      },
    });
  }

  async getProduct(userId: string, productId: string): Promise<GetProductDTO> {
    return this.prisma.product
      .findFirstOrThrow({
        where: {
          id: productId,
        },
        include: {
          userFavorite: {
            select: {
              userId: true,
            },
            where: {
              userId: userId,
            },
          },
          fundingLog: {
            select: {
              amount: true,
              createdAt: true,
            },
          },
          productQnA: {
            select: {
              content: true,
              authorType: true,
              createdAt: true,
              authorId: true,
            },
          },
          categories: {
            select: {
              category: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      })
      .then((product) => {
        return {
          ...product,
          userFavorite: !!product.userFavorite.length,
        };
      })
      .then((product) => {
        return {
          ...product,
          categories: product.categories.map((category) => category.category.name),
        };
      })
      .then((product) => {
        return {
          ...product,
          graph: product.fundingLog.map((log, y) => ({
            x: log.amount,
            y,
          })),
        };
      })
      .then((product) => {
        const copy: { [key: string]: any } = { ...product };
        delete copy['fundingLog'];

        return copy as unknown as GetProductDTO;
      })
      .catch((error) => {
        throw new NotFoundException(error.message);
      });
  }

  async getProducts(type: ProductType | undefined) {
    console.log('🚀 ~ ProductService ~ getProducts ~ type:', type);
    return this.prisma.product
      .findMany({
        select: {
          id: true,
          name: true,
          image: true,
          currentAmount: true,
          categories: {
            select: {
              category: {
                select: {
                  id: true,
                },
              },
            },
          },
        },
        where: {
          type: type ? { equals: type } : undefined,
        },
      })
      .then((product) => product.map((p) => ({ ...p, categoryId: p.categories[0].category.id }))) // 0번째 카테고리 ID만 가져오기
      .then((product) =>
        product.map((p) => {
          const copy: { [key: string]: any } = { ...p };
          delete copy['categories'];

          return copy as unknown as GetProductsDTO;
        }),
      );
  }

  async getFavoriteProducts(userId: string) {
    return this.prisma.product.findMany({
      select: {
        id: true,
        name: true,
        image: true,
        type: true,
        currentAmount: true,
      },
      where: {
        userFavorite: {
          some: {
            userId,
          },
        },
      },
    });
  }

  async searchProducts(keyword: string) {
    return this.prisma.product.findMany({
      where: {
        name: {
          contains: keyword,
        },
      },
      select: {
        id: true,
        name: true,
        image: true,
        type: true,
        currentAmount: true,
      },
    });
  }

  async favoriteProduct(userId: string, productId: string) {
    return this.prisma.userFavorite
      .create({
        data: {
          user: {
            connect: {
              id: userId,
            },
          },
          product: {
            connect: {
              id: productId,
            },
          },
        },
      })
      .catch(() => {
        throw new BadRequestException('이미 찜한 상품입니다.');
      });
  }

  async unfavoriteProduct(userId: string, productId: string) {
    return this.prisma.userFavorite
      .delete({
        where: {
          userId_productId: {
            userId,
            productId,
          },
        },
      })
      .catch(() => {
        throw new BadRequestException('찜한 상품이 아닙니다.');
      });
  }

  async createProductQnA(userId: string, { productId, content }: CreateProductQnADTO) {
    const product = await this.prisma.product.findUnique({
      where: {
        id: productId,
      },
    });

    if (!product) throw new NotFoundException('상품을 찾을 수 없습니다.');

    return this.prisma.productQnA.create({
      data: {
        content,
        authorType:
          product.ownerId === userId ? ProductQnAAuthorType.SELLER : ProductQnAAuthorType.BUYER,
        user: {
          connect: {
            id: userId,
          },
        },
        product: {
          connect: {
            id: productId,
          },
        },
      },
    });
  }

  async purchaseProductToken(userId: string, productId: string, amount: number) {
    const product = await this.prisma.product.findUnique({
      where: {
        id: productId,
      },
    });

    if (!product) throw new NotFoundException('상품을 찾을 수 없습니다.');
    if (!product.tokenAddress) throw new InternalServerErrorException('토큰 주소가 없습니다.');

    const user = await this.prisma.user.findUnique({
      select: {
        userAccount: {
          select: {
            id: true,
            credit: true,
            walletAddress: true,
          },
        },
      },
      where: {
        id: userId,
      },
    });

    if (!user) throw new NotFoundException('사용자를 찾을 수 없습니다.');
    if (!user.userAccount) throw new InternalServerErrorException('사용자 어카운트가 없습니다.');
    if (!user.userAccount.walletAddress) throw new BadRequestException('지갑 주소가 없습니다.');

    if (product.currentAmount * amount > (user.userAccount.credit ?? 0))
      throw new BadRequestException('잔액이 부족합니다.');

    await this.prisma.userAccount.update({
      where: {
        id: user.userAccount.id,
      },
      data: {
        credit: user.userAccount.credit - product.currentAmount * amount,
      },
    });

    const userTokenBalance = await this.prisma.userTokenBalancesOnProduct
      .findFirstOrThrow({
        where: {
          AND: [
            {
              productId,
            },
            {
              userAccountId: user.userAccount.id,
            },
          ],
        },
      })
      .catch(() =>
        this.prisma.userTokenBalancesOnProduct.create({
          data: {
            product: {
              connect: {
                id: productId,
              },
            },
            userAccount: {
              connect: {
                id: user.userAccount!.id,
              },
            },
          },
        }),
      );

    await this.prisma.userTokenBalancesOnProduct
      .update({
        where: {
          id: userTokenBalance.id,
        },
        data: {
          token: {
            increment: amount,
          },
        },
      })
      .then(() =>
        this.prisma.product.update({
          where: {
            id: productId,
          },
          data: {
            collectedAmount: {
              increment: product.currentAmount * amount,
            },
            fundingLog: {
              create: {
                amount,
                price: product.currentAmount,
                userTokenBalance: {
                  connect: {
                    id: userTokenBalance.id,
                  },
                },
              },
            },
          },
        }),
      );

    await this.blockchainService.transfer(
      user.userAccount.walletAddress,
      amount,
      product.tokenAddress,
    );
  }

  // async sellProductToken(userId: string, productId: string, amount: number) {}

  // async createProductQnA(userId: string, productId: string, content: string) {}

  // async createProductQnAReply(userId: string, productId: string, content: string) {}
}
