import { reviewsService } from "./reviews.service.js";
import { catchAsync } from "../../utils/catchAsync.js";

export class ReviewsController {
  getAllReviews = catchAsync(async (req, res) => {
    const result = await reviewsService.getAllReviews(req.query);
    res.json(result);
  });

  deleteReview = catchAsync(async (req, res) => {
    const result = await reviewsService.deleteReview(req.params.id);
    res.json(result);
  });
}

export const reviewsController = new ReviewsController();
