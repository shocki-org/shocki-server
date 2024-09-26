import { Injectable } from '@nestjs/common';

import { PrismaService } from 'src/common/modules/prisma/prisma.service';

@Injectable()
export class CategoryService {
  constructor(private readonly prisma: PrismaService) {}

  async getCategories() {
    return (
      this.prisma.category
        .findMany({
          select: { id: true, name: true },
        })
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        .then((categories) => categories.sort((a, _) => (a.name === '리빙' ? -1 : 1))) // 리빙 카테고리를 가장 앞으로
    );
  }

  async getProductsByCategoryId(categoryId: string) {
    return this.prisma.product.findMany({
      where: {
        categories: {
          some: {
            category: {
              id: categoryId,
            },
          },
        },
      },

      select: { id: true, name: true, image: true, currentAmount: true },
    });
  }
}
