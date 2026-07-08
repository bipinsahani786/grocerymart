import { bookingsService } from "./bookings.service.js";
import { catchAsync } from "../../utils/catchAsync.js";

export class BookingsController {
  getAllBookings = catchAsync(async (req, res) => {
    const result = await bookingsService.getAllBookings(req.query);
    res.json(result);
  });

  getBookingDetails = catchAsync(async (req, res) => {
    const result = await bookingsService.getBookingDetails(req.params.bookingId);
    res.json(result);
  });

  adminCancelBooking = catchAsync(async (req, res) => {
    const result = await bookingsService.adminCancelBooking(req.params.bookingId);
    res.json(result);
  });

  getBookingStats = catchAsync(async (req, res) => {
    const result = await bookingsService.getBookingStats();
    res.json(result);
  });
}

export const bookingsController = new BookingsController();
