import { prisma } from '../index';

export class RoundService {
  static async getActiveRound() {
    return await prisma.round.findFirst({
      where: { is_active: true }
    });
  }

  static async getAllRounds() {
    return await prisma.round.findMany({
      orderBy: { id: 'asc' }
    });
  }

  static async activateRound(roundId: number) {
    // Transaction to ensure only one round is active and all others are locked.
    return await prisma.$transaction([
      prisma.round.updateMany({
        data: { is_active: false, is_locked: true }
      }),
      prisma.round.update({
        where: { id: roundId },
        data: { is_active: true, is_locked: false }
      })
    ]);
  }

  static async unlockRound(roundId: number) {
    // Only one round can be unlocked at a time; unlocking another locks the rest.
    return await prisma.$transaction([
      prisma.round.updateMany({
        data: { is_active: false, is_locked: true }
      }),
      prisma.round.update({
        where: { id: roundId },
        data: { is_active: false, is_locked: false }
      })
    ]);
  }

  static async deactivateRound(roundId: number) {
    return await prisma.round.update({
      where: { id: roundId },
      data: { is_active: false, is_locked: true }
    });
  }

  static async isRoundActionable(roundId: number) {
    const round = await prisma.round.findUnique({ where: { id: roundId } });
    return round?.is_active && !round?.is_locked;
  }
}
