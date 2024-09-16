import { ProductQnAAuthorType } from '@prisma/client';
import { DateTime } from 'luxon';

import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from 'src/common/modules/prisma/prisma.service';

import { CreateProductDTO } from './dto/create.product.dto';
import { CreateProductQnADTO } from './dto/create.qna.dto';
import { GetProductDTO } from './dto/get.product.dto';

@Injectable()
export class ProductService {
  constructor(private readonly prisma: PrismaService) {}

  async createTestProduct(userId: string) {
    return this.prisma.product
      .create({
        data: {
          user: {
            connect: {
              id: userId,
            },
          },
          name: '상품 이름',
          image: '상품 이미지 URL',
          detailImage: '상세 이미지 URL',
          type: 'FUNDING',
          currentAmount: 13000,
          targetAmount: 20000,
          collectedAmount: 0,
          fundingEndDate: DateTime.now().plus({ days: 7 }).toJSDate(),
          fundingLog: {
            create: [
              {
                amount: 10000,
                user: {
                  connect: {
                    id: userId,
                  },
                },
                createdAt: DateTime.now().minus({ days: 1 }).toJSDate(),
              },
              {
                amount: 13000,
                user: {
                  connect: {
                    id: userId,
                  },
                },
                createdAt: DateTime.now().toJSDate(),
              },
            ],
          },
          productQnA: {
            create: [
              {
                content: '상품 문의 1',
                authorType: 'BUYER',
                user: {
                  connect: {
                    id: userId,
                  },
                },
              },
              {
                content: '상품 답변 1',
                authorType: 'SELLER',
                user: {
                  connect: {
                    id: userId,
                  },
                },
              },
            ],
          },
          categories: {
            create: [
              {
                category: {
                  create: {
                    name: 'test category 1',
                  },
                },
              },
              {
                category: {
                  create: {
                    name: 'test category 2',
                  },
                },
              },
            ],
          },
        },
      })
      .then((product) => console.log(product.id));
  }

  async createProduct(userId: string, dto: CreateProductDTO) {
    return this.prisma.product.create({
      data: {
        name: dto.name,
        image: '상품 이미지 URL',
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

  async getProducts() {
    return this.prisma.product.findMany({
      select: {
        id: true,
        name: true,
        image: true,
        currentAmount: true,
      },
    });
  }

  async getFavoriteProducts(userId: string) {
    return this.prisma.product.findMany({
      select: {
        id: true,
        name: true,
        image: true,
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

  // async buyProductToken(userId: string, productId: string, amount: number) {}

  // async sellProductToken(userId: string, productId: string, amount: number) {}

  // async createProductQnA(userId: string, productId: string, content: string) {}

  // async createProductQnAReply(userId: string, productId: string, content: string) {}
}
