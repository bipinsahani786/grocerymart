import { bookingsRepository } from "./bookings.repository.js";
import { AppError } from "../../utils/AppError.js";

export class BookingsService {
  async getAllBookings(query) {
    const filters = {};
    if (query.status) filters.status = query.status;
    if (query.parkingId) filters.parkingId = query.parkingId;
    if (query.userId) filters.userId = query.userId;
    if (query.vehicleType) filters.vehicleType = query.vehicleType;

    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 10;
    const search = query.search || "";

    const result = await bookingsRepository.findAllBookings(filters, page, limit, search);
    return {
      success: true,
      data: result.data,
      meta: result.meta,
      message: "All bookings retrieved successfully",
    };
  }

  async getBookingDetails(bookingId) {
    const booking = await bookingsRepository.findBookingById(bookingId);
    if (!booking) throw new AppError("Booking not found", 404);

    return {
      success: true,
      data: booking,
      message: "Booking details retrieved successfully",
    };
  }

  async adminCancelBooking(bookingId) {
    const booking = await bookingsRepository.findBookingById(bookingId);
    if (!booking) throw new AppError("Booking not found", 404);

    if (booking.status === "cancelled") {
      throw new AppError("Booking is already cancelled", 400);
    }
    if (booking.status === "completed") {
      throw new AppError("Cannot cancel a completed booking", 400);
    }

    const cancellationFeeRate = await bookingsRepository.getPlatformCancellationRate();
    const result = await bookingsRepository.adminCancelBookingTransaction(bookingId, booking, cancellationFeeRate);

    return {
      success: true,
      data: {
        bookingId,
        refundAmount: result.refundAmount,
        cancellationFee: result.cancellationFee,
        status: "cancelled",
      },
      message: `Booking force-cancelled by admin. ₹${result.refundAmount.toFixed(2)} refunded to driver wallet.`,
    };
  }

  async getBookingStats() {
    const stats = await bookingsRepository.getBookingStats();
    return {
      success: true,
      data: stats,
      message: "Booking statistics retrieved successfully",
    };
  }
}

export const bookingsService = new BookingsService();
