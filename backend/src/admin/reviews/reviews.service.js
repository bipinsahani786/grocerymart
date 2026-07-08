import { reviewsRepository } from "./reviews.repository.js";
import { AppError } from "../../utils/AppError.js";

export class ReviewsService {
  async getAllReviews(query = {}) {
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 10;
    const search = query.search || "";
    const rating = query.rating || "";

    const result = await reviewsRepository.findAllReviews(page, limit, search, rating);
    return {
      success: true,
      data: result.data,
      meta: result.meta,
      message: "All reviews retrieved successfully",
    };
  }

  async deleteReview(id) {
    try {
      await reviewsRepository.deleteReview(id);
      return {
        success: true,
        message: "Review deleted successfully by administrator",
      };
    } catch (error) {
      throw new AppError("Review not found or could not be deleted", 404);
    }
  }
}

export const reviewsService = new ReviewsService();
