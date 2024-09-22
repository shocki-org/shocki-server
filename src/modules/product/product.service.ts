import { FundingType, ProductQnAAuthorType, ProductType } from '@prisma/client';
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
import { UploadProductDetailImageDTO } from './dto/image.product.dto';

@Injectable()
export class ProductService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly blockchain: BlockchainService,
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
        startAmount: dto.currentAmount,
        currentAmount: dto.currentAmount,
        targetAmount: dto.targetAmount,
        distributionPercent: Number(dto.distributionPercent),
        fundingEndDate: DateTime.fromISO(dto.fundingEndDate).toJSDate(),
        marketEndDate: DateTime.fromISO(dto.marketEndDate).toJSDate(),
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

    await this.prisma.productDetailImage.create({
      data: {
        image: `${this.configService.get('S3_PUBLIC_URL')}/cover.png`,
        index: 0,
        product: {
          connect: {
            id: product.id,
          },
        },
      },
    });

    const address = await this.blockchain.create(
      dto.name,
      product.id.split('-')[0],
      `${this.configService.get('S3_PUBLIC_URL')}/${product.id}/1.png`,
    );

    console.log(address);

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

  async updateProductType(userId: string, productId: string) {
    const product = await this.prisma.product.findUnique({
      where: {
        id: productId,
      },
    });

    if (!product) throw new NotFoundException('상품을 찾을 수 없습니다.');
    if (product.ownerId !== userId) throw new BadRequestException('상품 소유자가 아닙니다.');
    if (product.type === ProductType.SELLING)
      throw new BadRequestException('이미 마켓 상품입니다.');

    const fundingEndDate = DateTime.fromJSDate(product.fundingEndDate);

    if (fundingEndDate.diffNow('days').days < 0)
      return this.prisma.product.update({
        where: {
          id: productId,
        },
        data: {
          type: ProductType.SELLING,
          marketEndDate: DateTime.now()
            .set({
              hour: 0,
              minute: 0,
              second: 0,
              millisecond: 0,
            })
            .plus({ years: 1 })
            .toJSDate(),
        },
      });
    else throw new BadRequestException('펀딩 기간이 종료되지 않았습니다.');
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

  async uploadProductDetailImage(userId: string, dto: UploadProductDetailImageDTO) {
    const product = await this.prisma.product.findUnique({
      where: {
        id: dto.productId,
      },
    });

    if (!product) throw new NotFoundException('상품을 찾을 수 없습니다.');
    if (product.ownerId !== userId) throw new BadRequestException('상품 소유자가 아닙니다.');

    const key = `${product.id}/detail/${dto.index}.png`;

    const url = await this.s3Service.uploadImage(key, dto.base64Image);

    return this.prisma.productDetailImage.create({
      data: {
        image: url,
        index: dto.index,
        product: {
          connect: {
            id: dto.productId,
          },
        },
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
              price: true,
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
          productDetailImage: {
            select: {
              image: true,
              index: true,
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
          detailImages: product.productDetailImage
            .sort((a, b) => a.index - b.index)
            .map((image) => image.image),
        };
      })
      .then((product) => {
        return {
          ...product,
          graph: product.fundingLog.map((log, x) => ({
            x,
            y: log.price,
          })),
        };
      })
      .then((product) => {
        return {
          ...product,
          purchaseIsDisabled:
            product.fundingEndDate < DateTime.now().toJSDate() &&
            product.type === ProductType.FUNDING,
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

  async purchaseMarketProduct(
    userId: string,
    dto: { productId: string; amount: number; phone: string; address: string },
  ) {
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

    const product = await this.prisma.product.findUnique({
      where: {
        id: dto.productId,
      },
    });
    if (!product) throw new NotFoundException('상품을 찾을 수 없습니다.');

    if (product.type !== ProductType.SELLING)
      throw new BadRequestException('마켓 상품이 아닙니다.');

    if (product.currentAmount * dto.amount > (user.userAccount.credit ?? 0))
      throw new BadRequestException('잔액이 부족합니다.');

    return this.prisma.$transaction(async (tx) => {
      await tx.userAccount.update({
        where: {
          id: user.userAccount!.id,
        },
        data: {
          credit: user.userAccount!.credit - product.currentAmount * dto.amount,
        },
      });

      await tx.userMarketPurchase.create({
        data: {
          phone: dto.phone,
          address: dto.address,
          amount: Number(dto.amount),
          price: product.currentAmount,
          userAccount: {
            connect: {
              id: user.userAccount!.id,
            },
          },
          product: {
            connect: {
              id: dto.productId,
            },
          },
        },
      });
    });
  }

  async saleProductToken(userId: string, productId: string) {
    const product = await this.prisma.product.findUnique({
      select: {
        tokenAddress: true,
        currentAmount: true,
        fundingEndDate: true,
        type: true,
      },
      where: {
        id: productId,
      },
    });

    if (!product) throw new NotFoundException('상품을 찾을 수 없습니다.');
    if (!product.tokenAddress) throw new InternalServerErrorException('토큰 주소가 없습니다.');
    if (product.type !== ProductType.FUNDING)
      throw new BadRequestException('펀딩 상품이 아닙니다.');
    if (product.fundingEndDate < DateTime.now().toJSDate())
      throw new BadRequestException('펀딩 기간이 종료되었습니다.');

    const user = await this.prisma.user.findUnique({
      select: {
        userAccount: {
          select: {
            id: true,
            walletAddress: true,
            userTokenBalancesOnProduct: {
              select: {
                id: true,
                token: true,
              },
              where: {
                product: {
                  id: productId,
                },
                userAccount: {
                  user: {
                    id: userId,
                  },
                },
              },
            },
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
    if (!user.userAccount.userTokenBalancesOnProduct.length)
      throw new BadRequestException('상품 토큰이 없습니다.');

    const beforeTokenBalance = user.userAccount.userTokenBalancesOnProduct[0];
    const newTokenBalance = await this.blockchain.getBalance(
      product.tokenAddress,
      user.userAccount.walletAddress,
    );

    if (beforeTokenBalance.token <= newTokenBalance)
      throw new BadRequestException('토큰이 충분하지 않습니다.');

    return this.prisma.$transaction(async (tx) => {
      await tx.userTokenBalancesOnProduct.update({
        where: {
          id: beforeTokenBalance.id,
        },
        data: {
          token: {
            decrement: beforeTokenBalance.token - newTokenBalance,
          },
        },
      });

      await tx.userAccount.update({
        where: {
          id: user.userAccount!.id,
        },
        data: {
          credit: {
            increment: (beforeTokenBalance.token - newTokenBalance) * product.currentAmount,
          },
        },
      });

      await tx.product.update({
        where: {
          id: productId,
        },
        data: {
          collectedAmount: {
            decrement: (beforeTokenBalance.token - newTokenBalance) * product.currentAmount,
          },
          fundingLog: {
            create: {
              amount: beforeTokenBalance.token - newTokenBalance,
              price: product.currentAmount,
              type: FundingType.WITHDRAW,
              userTokenBalance: {
                connect: {
                  id: beforeTokenBalance.id,
                },
              },
            },
          },
        },
      });
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
    if (product.type !== ProductType.FUNDING)
      throw new BadRequestException('펀딩 상품이 아닙니다.');
    if (product.fundingEndDate < DateTime.now().toJSDate())
      throw new BadRequestException('펀딩 기간이 종료되었습니다.');

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

    return this.prisma.$transaction(async (tx) => {
      await tx.userAccount.update({
        where: {
          id: user.userAccount!.id,
        },
        data: {
          credit: {
            decrement: product.currentAmount * amount,
          },
        },
      });

      const userTokenBalance = await tx.userTokenBalancesOnProduct
        .findFirstOrThrow({
          where: {
            AND: [
              {
                productId,
              },
              {
                userAccountId: user.userAccount!.id,
              },
            ],
          },
        })
        .catch(() =>
          tx.userTokenBalancesOnProduct.create({
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

      await tx.userTokenBalancesOnProduct.update({
        where: {
          id: userTokenBalance.id,
        },
        data: {
          token: {
            increment: Number(amount),
          },
        },
      });

      await tx.product.update({
        where: {
          id: productId,
        },
        data: {
          collectedAmount: {
            increment: product.currentAmount * amount,
          },
          fundingLog: {
            create: {
              amount: Number(amount),
              price: product.currentAmount,
              type: FundingType.DEPOSIT,
              userTokenBalance: {
                connect: {
                  id: userTokenBalance.id,
                },
              },
            },
          },
        },
      });

      await this.blockchain.getRemainingTokens(product.tokenAddress!).then((remaining) => {
        if (remaining < amount) throw new BadRequestException('남은 토큰이 부족합니다.');
      });

      await this.blockchain.transfer(
        user.userAccount!.walletAddress!,
        amount,
        product.tokenAddress!,
      );
    });
  }
}
