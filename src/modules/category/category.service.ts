import { Injectable } from '@nestjs/common';

import { PrismaService } from 'src/common/modules/prisma/prisma.service';

@Injectable()
export class CategoryService {
  constructor(private readonly prisma: PrismaService) {}

  async getCategories() {
    return this.prisma.category.findMany({
      select: { id: true, name: true },
    });
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
