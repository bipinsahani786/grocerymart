import { prisma } from "../../../config/prisma.js";

export class ReviewsRepository {
  async findAllReviews(page = 1, limit = 10, search = "", rating = "") {
    const skip = (page - 1) * limit;
    const parsedLimit = parseInt(limit, 10);
    const parsedPage = parseInt(page, 10);

    const where = {};
    if (rating) {
      where.rating = parseInt(rating, 10);
    }
    if (search) {
      where.OR = [
        { comment: { contains: search, mode: "insensitive" } },
        { reviewer: { name: { contains: search, mode: "insensitive" } } },
        { reviewer: { email: { contains: search, mode: "insensitive" } } },
      ];
    }

    // Fetch paginated reviews with reviewer/driver info
    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        include: {
          reviewer: {
            select: { id: true, name: true, email: true, phone: true },
          },
          booking: {
            select: {
              id: true,
              startTime: true,
              endTime: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: parsedLimit,
      }),
      prisma.review.count({ where }),
    ]);

    // Populate target names (Parking or Addon)
    const parkingIds = reviews
      .filter((r) => r.targetType === "parking")
      .map((r) => r.targetId);
    const addonIds = reviews
      .filter((r) => r.targetType === "addon")
      .map((r) => r.targetId);

    const [parkings, addons] = await Promise.all([
      prisma.parking.findMany({
        where: { id: { in: parkingIds } },
        select: { id: true, name: true },
      }),
      prisma.customAddon.findMany({
        where: { id: { in: addonIds } },
        select: { id: true, name: true },
      }),
    ]);

    const parkingMap = new Map(parkings.map((p) => [p.id, p.name]));
    const addonMap = new Map(addons.map((a) => [a.id, a.name]));

    const mappedData = reviews.map((review) => {
      let targetName = "Unknown Target";
      if (review.targetType === "parking") {
        targetName = parkingMap.get(review.targetId) || "Deleted Parking";
      } else if (review.targetType === "addon") {
        targetName = addonMap.get(review.targetId) || "Deleted Add-on Service";
      }

      return {
        ...review,
        targetName,
      };
    });

    return {
      data: mappedData,
      meta: {
        total,
        page: parsedPage,
        limit: parsedLimit,
        totalPages: Math.ceil(total / parsedLimit),
      },
    };
  }

  async deleteReview(id) {
    return await prisma.review.delete({
      where: { id },
    });
  }
}

export const reviewsRepository = new ReviewsRepository();
