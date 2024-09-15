import { DateTime } from 'luxon';

import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from 'src/common/modules/prisma/prisma.service';

import { CreateProductDTO } from './dto/create.product.dto';

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

  async getProduct(productId: string) {
    return this.prisma.product
      .findFirstOrThrow({
        where: {
          id: productId,
        },
        include: {
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
      .catch((error) => {
        throw new NotFoundException(error.message);
      });
  }

  // async buyProductToken(userId: string, productId: string, amount: number) {}

  // async sellProductToken(userId: string, productId: string, amount: number) {}

  // async createProductQnA(userId: string, productId: string, content: string) {}

  // async createProductQnAReply(userId: string, productId: string, content: string) {}
}
