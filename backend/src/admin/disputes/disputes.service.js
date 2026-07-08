import { disputesRepository } from "./disputes.repository.js";
import { AppError } from "../../utils/AppError.js";

export class DisputesService {
  async getDisputes(params = {}) {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;

    const [disputes, total] = await Promise.all([
      disputesRepository.findDisputes({ skip, take: limit }),
      disputesRepository.countDisputes(),
    ]);

    return {
      success: true,
      data: disputes,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      message: "Disputes retrieved successfully",
    };
  }

  async resolveDispute(disputeId, { resolution, refundAmount, adminNote }) {
    const dispute = await disputesRepository.findDisputeById(disputeId);
    if (!dispute) throw new AppError("Dispute ticket not found", 404);

    if (dispute.status === "resolved") {
      throw new AppError("Dispute ticket is already resolved", 400);
    }

    const amount = refundAmount ? parseFloat(refundAmount) : 0;
    const resolved = await disputesRepository.resolveDisputeTransaction(
      disputeId,
      dispute.bookingId,
      dispute.booking.userId,
      resolution,
      amount,
      adminNote
    );

    return {
      success: true,
      data: resolved,
      message: `Dispute ticket resolved successfully with resolution '${resolution}'`,
    };
  }
}

export const disputesService = new DisputesService();
