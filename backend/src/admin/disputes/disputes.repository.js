import { prisma } from "../../../config/prisma.js";

export class DisputesRepository {
  async findDisputes(options = {}) {
    const { skip, take } = options;
    return await prisma.dispute.findMany({
      include: {
        booking: {
          include: {
            parking: { select: { name: true } },
            user: { select: { name: true, phone: true } },
          },
        },
        raisedBy: { select: { name: true, userType: true } },
      },
      orderBy: { createdAt: "desc" },
      ...(skip !== undefined && { skip }),
      ...(take !== undefined && { take }),
    });
  }

  async countDisputes() {
    return await prisma.dispute.count();
  }

  async findDisputeById(id) {
    return await prisma.dispute.findUnique({
      where: { id },
      include: { booking: true },
    });
  }

  async resolveDisputeTransaction(disputeId, bookingId, userId, resolution, refundAmount, adminNote) {
    return await prisma.$transaction(async (tx) => {
      const dispute = await tx.dispute.update({
        where: { id: disputeId },
        data: {
          status: "resolved",
          resolution,
          refundAmount,
          adminNote,
          resolvedAt: new Date(),
        },
      });

      if (refundAmount && refundAmount > 0) {
        const updatedUser = await tx.user.update({
          where: { id: userId },
          data: { walletBalance: { increment: refundAmount } },
        });

        await tx.walletTxn.create({
          data: {
            userId,
            type: "refund",
            amount: refundAmount,
            referenceId: disputeId,
            referenceType: "dispute",
            description: `Dispute Resolution Refund: ${resolution}`,
            balanceAfter: updatedUser.walletBalance,
          },
        });
      }

      return dispute;
    });
  }
}

export const disputesRepository = new DisputesRepository();
