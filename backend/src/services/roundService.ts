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
    // Transaction to ensure only one round is active
    return await prisma.$transaction([
      prisma.round.updateMany({
        where: { is_active: true },
        data: { is_active: false, is_locked: true }
      }),
      prisma.round.update({
        where: { id: roundId },
        data: { is_active: true, is_locked: false }
      })
    ]);
  }

  static async isRoundActionable(roundId: number) {
    const round = await prisma.round.findUnique({ where: { id: roundId } });
    return round?.is_active && !round?.is_locked;
  }
}
