import { prisma } from "../../../config/prisma.js";

export class BookingsRepository {
  async findAllBookings(filters, page = 1, limit = 10, search = "") {
    const skip = (page - 1) * limit;
    const parsedLimit = parseInt(limit, 10);
    const parsedPage = parseInt(page, 10);

    const where = {};
    if (filters.status) where.status = filters.status;
    if (filters.parkingId) where.parkingId = filters.parkingId;
    if (filters.userId) where.userId = filters.userId;
    if (filters.vehicleType) where.vehicleType = filters.vehicleType;

    if (search) {
      where.OR = [
        { id: { contains: search, mode: "insensitive" } },
        { user: { name: { contains: search, mode: "insensitive" } } },
        { user: { email: { contains: search, mode: "insensitive" } } },
        { parking: { name: { contains: search, mode: "insensitive" } } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        include: {
          user: {
            select: { id: true, name: true, phone: true, email: true },
          },
          parking: {
            select: {
              id: true,
              name: true,
              address: true,
              parkingType: true,
              ownerId: true,
              user: { select: { name: true, phone: true } },
            },
          },
          addonBookings: {
            include: {
              customAddon: { select: { name: true, price: true, image: true } },
            },
          },
          disputes: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: parsedLimit,
      }),
      prisma.booking.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page: parsedPage,
        limit: parsedLimit,
        totalPages: Math.ceil(total / parsedLimit),
      },
    };
  }

  async findBookingById(id) {
    return await prisma.booking.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, phone: true, email: true, walletBalance: true },
        },
        parking: {
          select: {
            id: true,
            name: true,
            address: true,
            parkingType: true,
            ownerId: true,
            user: { select: { id: true, name: true, phone: true, email: true } },
            slots: true,
            pricingRules: true,
          },
        },
        addonBookings: {
          include: { customAddon: true },
        },
        disputes: {
          include: {
            raisedBy: { select: { name: true, userType: true } },
          },
        },
        reviews: true,
      },
    });
  }

  async adminCancelBookingTransaction(bookingId, booking, cancellationFeeRate) {
    return await prisma.$transaction(async (tx) => {
      const grossAmount = parseFloat(booking.grossAmount);
      const cancellationFee = grossAmount * cancellationFeeRate;
      const refundAmount = grossAmount - cancellationFee;

      const cancelled = await tx.booking.update({
        where: { id: bookingId },
        data: { status: "cancelled" },
      });

      const slot = await tx.parkingSlot.findFirst({
        where: { parkingId: booking.parkingId, vehicleType: booking.vehicleType },
      });
      if (slot) {
        await tx.parkingSlot.update({
          where: { id: slot.id },
          data: { availableSlots: { increment: 1 } },
        });
      }

      const updatedUser = await tx.user.update({
        where: { id: booking.userId },
        data: { walletBalance: { increment: refundAmount } },
      });

      await tx.walletTxn.create({
        data: {
          userId: booking.userId,
          type: "refund",
          amount: refundAmount,
          referenceId: bookingId,
          referenceType: "admin_cancellation",
          description: `Admin force-cancelled booking. Refund: ₹${refundAmount.toFixed(2)} (Fee: ${(cancellationFeeRate * 100).toFixed(0)}%)`,
          balanceAfter: updatedUser.walletBalance,
        },
      });

      return { cancelled, refundAmount, cancellationFee };
    });
  }

  async getBookingStats() {
    const [total, confirmed, active, completed, cancelled] = await Promise.all([
      prisma.booking.count(),
      prisma.booking.count({ where: { status: "confirmed" } }),
      prisma.booking.count({ where: { status: "active" } }),
      prisma.booking.count({ where: { status: "completed" } }),
      prisma.booking.count({ where: { status: "cancelled" } }),
    ]);

    const revenueResult = await prisma.booking.aggregate({
      where: { status: { in: ["confirmed", "active", "completed"] } },
      _sum: { grossAmount: true, commission: true, ownerShare: true },
    });

    return {
      counts: { total, confirmed, active, completed, cancelled },
      revenue: {
        totalGross: revenueResult._sum.grossAmount || 0,
        totalCommission: revenueResult._sum.commission || 0,
        totalOwnerShare: revenueResult._sum.ownerShare || 0,
      },
    };
  }

  async getPlatformCancellationRate() {
    const setting = await prisma.systemSetting.findUnique({
      where: { key: "platform_settings" },
    });
    if (!setting || !setting.value) return 0.05;
    return parseFloat(setting.value.cancellationFeeRate);
  }
}

export const bookingsRepository = new BookingsRepository();
