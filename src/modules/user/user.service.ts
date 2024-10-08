import { Prisma, Provider } from '@prisma/client';
import { DateTime } from 'luxon';

import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { PrismaService } from 'src/common/modules/prisma/prisma.service';

import { BlockchainService } from '../blockchain/blockchain.service';
import { PayDTO } from './dto/pay.user.dto';
import { SettlementProductDTO } from './dto/settlement.user.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly blockchain: BlockchainService,
    private readonly configService: ConfigService<
      {
        KAKAO_API_ADMIN_KEY: string;
      },
      true
    >,
  ) {}

  async getUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      select: {
        id: true,
        userAccount: {
          select: {
            id: true,
            credit: true,
          },
        },
      },
      where: {
        id: userId,
      },
    });

    if (!user) throw new NotFoundException('사용자를 찾을 수 없습니다.');

    return user;
  }

  async updateTokenBalancees(userId: string) {
    return this.prisma.userAccount
      .findFirst({
        select: {
          id: true,
          walletAddress: true,
          userTokenBalancesOnProduct: {
            select: {
              id: true,
              token: true,
              product: {
                select: {
                  id: true,
                  tokenAddress: true,
                },
              },
            },
          },
        },
        where: {
          userId,
        },
      })
      .then(async (userAccount) => {
        if (!userAccount) throw new NotFoundException('사용자 어카운트를 찾을 수 없습니다.');

        for (const productToken of userAccount.userTokenBalancesOnProduct) {
          if (!productToken.product.tokenAddress) continue;

          const tokenBalance = await this.blockchain.getBalance(
            productToken.product.tokenAddress,
            userAccount.walletAddress!,
          );

          await this.prisma.userTokenBalancesOnProduct.update({
            data: {
              token: tokenBalance,
            },
            where: {
              id: productToken.id,
            },
          });
        }
      });
  }

  async balance(userId: string) {
    this.updateTokenBalancees(userId);
    const user = await this.prisma.user.findUnique({
      select: {
        id: true,
        userAccount: {
          include: {
            userTokenBalancesOnProduct: {
              include: {
                product: {
                  select: {
                    name: true,
                    image: true,
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
    if (!user.userAccount) throw new NotFoundException('사용자 어카운트를 찾을 수 없습니다.');

    const credit = user.userAccount.credit;
    const tokenBalances = user.userAccount.userTokenBalancesOnProduct.map((productToken) => {
      return {
        tokenAmount: productToken.token,
        productId: productToken.productId,
        productName: productToken.product.name,
        productImage: productToken.product.image,
      };
    });

    return {
      credit,
      tokenBalances,
      settlement: await this.settlement(userId),
    };
  }

  async settlement(userId: string) {
    const user = await this.prisma.user.findUnique({
      select: {
        id: true,
        userAccount: {
          select: {
            id: true,
            userTokenBalancesOnProduct: {
              select: {
                token: true,
                product: {
                  select: {
                    id: true,
                    distributionPercent: true,
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
    if (!user.userAccount) throw new NotFoundException('사용자 어카운트를 찾을 수 없습니다.');

    const marketPurchases = await this.prisma.userMarketPurchase
      .findMany({
        select: {
          amount: true,
          price: true,
          createdAt: true,
          product: {
            select: {
              id: true,
              name: true,
              image: true,
              createdAt: true,
              fundingEndDate: true,
            },
          },
        },
        where: {
          product: {
            OR: user.userAccount.userTokenBalancesOnProduct.map((productToken) => ({
              id: productToken.product.id,
            })),
          },
        },
      })
      .then((purchases) =>
        purchases.map((purchase) => {
          const now = DateTime.now().setZone('utc').set({
            hour: 0,
            minute: 0,
            second: 0,
            millisecond: 0,
          });
          const startMarketAt = DateTime.fromJSDate(purchase.product.fundingEndDate)
            .setZone('utc')
            .set({
              hour: 0,
              minute: 0,
              second: 0,
              millisecond: 0,
            });
          const purchasedAt = DateTime.fromJSDate(purchase.createdAt).setZone('utc').set({
            hour: 0,
            minute: 0,
            second: 0,
            millisecond: 0,
          });

          const daysDiff = now.diff(startMarketAt, 'days').days;

          const quotient = Math.floor(daysDiff / 14);
          const intervalList = Array.from({ length: quotient + 2 }, (_, i) => i * 14);

          return {
            ...purchase,
            purchasedAt,
            intervalList,
            startMarketAt,
          };
        }),
      )
      .then((purchases) =>
        purchases.filter((purchase) => {
          for (let i = 0; i < purchase.intervalList.length - 1; i++) {
            if (
              purchase.intervalList[i] <=
                purchase.purchasedAt.diff(purchase.startMarketAt, 'days').days &&
              purchase.purchasedAt.diff(purchase.startMarketAt, 'days').days <
                purchase.intervalList[i + 1]
            ) {
              return true;
            }
          }
        }),
      );

    let totalSettlementAmount = 0;
    const settlementProducts: SettlementProductDTO[] = [];
    for (const purchase of marketPurchases) {
      const productToken = user.userAccount.userTokenBalancesOnProduct.find(
        (productToken) => productToken.product.id === purchase.product.id,
      );

      const settlementAmount =
        (purchase.amount / 1000) * purchase.price * productToken!.product.distributionPercent;
      totalSettlementAmount += settlementAmount;

      const settlementDate = purchase.startMarketAt
        .plus({ days: purchase.intervalList[purchase.intervalList.length - 1] })
        .toJSDate();

      settlementProducts.push({
        productId: purchase.product.id,
        productName: purchase.product.name,
        productImage: purchase.product.image!,
        settlementAmount,
        settlementDate,
      });
    }

    return {
      totalSettlementAmount,
      settlementProducts,
    };
  }

  async deliveryStatus(userId: string) {
    const purchases = await this.prisma.userMarketPurchase.findMany({
      select: {
        id: true,
        type: true,
        product: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      where: {
        userAccount: {
          user: {
            id: userId,
          },
        },
      },
    });

    return purchases.map((purchase) => ({
      purchaseId: purchase.id,
      productId: purchase.product.id,
      productName: purchase.product.name,
      productImage: purchase.product.image,
      status: purchase.type,
    }));
  }

  async favorite(userId: string) {
    const user = await this.prisma.user.findUnique({
      select: {
        id: true,
        favoriteProducts: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                image: true,
                currentAmount: true,
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

    const favoriteProducts = user.favoriteProducts.map((favorite) => ({
      productId: favorite.productId,
      productName: favorite.product.name,
      productImage: favorite.product.image,
      productPrice: favorite.product.currentAmount,
    }));

    return favoriteProducts;
  }

  async pay(userId: string, dto: PayDTO) {
    const url = 'https://api.tosspayments.com/v1/payments/confirm';
    const options = {
      method: 'POST',
      headers: {
        Authorization: 'Basic dGVzdF9za196WExrS0V5cE5BcldtbzUwblgzbG1lYXhZRzVSOg==', // Test API Key
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dto),
    };

    try {
      const response = await fetch(url, options);
      const data = await response.json();
      const { totalAmount } = data as { totalAmount: number };

      const user = await this.prisma.user.findUnique({
        select: {
          userAccount: {
            select: {
              id: true,
            },
          },
        },
        where: {
          id: userId,
        },
      });
      if (!user) throw new NotFoundException('사용자를 찾을 수 없습니다.');

      await this.prisma.userAccount
        .update({
          where: {
            id: user?.userAccount?.id,
          },
          data: {
            credit: {
              increment: totalAmount,
            },
          },
        })
        .catch((error) => {
          if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2025') {
              throw new NotFoundException('사용자를 찾을 수 없습니다.');
            }
          }
        });
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Payment confirmation failed');
    }
  }

  async updateWalletAddress(id: string, walletAddress: string) {
    const user = await this.prisma.userAccount.findUnique({
      where: {
        userId: id,
      },
    });

    if (user?.walletAddress === walletAddress) return;

    await this.prisma.userAccount.update({
      where: {
        userId: id,
      },
      data: {
        walletAddress,
      },
    });

    this.blockchain.sendToEth(walletAddress, 0.001);
  }

  async updateCredit(id: string, credit: number) {
    await this.prisma.userAccount.update({
      where: {
        userId: id,
      },
      data: {
        credit,
      },
    });
  }

  async deleteUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) throw new NotFoundException('사용자를 찾을 수 없습니다.');
    if (user.provider === Provider.KAKAO) {
      const KAKAOAK = this.configService.get('KAKAO_API_ADMIN_KEY', { infer: true });

      const data = new URLSearchParams();

      data.append('target_id_type', 'user_id');
      data.append('target_id', user.providerId);

      await fetch('https://kapi.kakao.com/v1/user/unlink', {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `KakaoAK ${KAKAOAK}`,
        },
        method: 'POST',
        body: data,
      })
        .then((res) => res.text())
        .then(console.log);
    }

    const res = await this.prisma.user
      .delete({
        where: {
          id: userId,
        },
      })
      .catch((error) => {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          if (error.code === 'P2003') {
            // Foreign key constraint failed
            const relationName = error.meta?.field_name as string; // 관계 이름 가져오기

            switch (relationName) {
              case 'Product_ownerId_fkey (index)':
                throw new BadRequestException(
                  '현재 사용자가 소유한 제품이 있습니다. 먼저 제품을 삭제해주세요.',
                );
            }
          }
          throw new InternalServerErrorException(
            '사용자를 삭제하는 중에 알 수 없는 오류가 발생했습니다.',
          );
        }
      });

    return res;
  }

  async updateFCMToken(id: string, fcmToken: string) {
    await this.prisma.user
      .update({
        where: {
          id,
        },
        data: {
          fcmToken,
        },
      })
      .catch((error) => {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          if (error.code === 'P2025') {
            throw new NotFoundException('사용자를 찾을 수 없습니다.');
          }
        }
      });
  }
}
