import { ownersRepository } from "../owners/owners.repository.js";

export const dashboardController = {
  getStats: async (req, res, next) => {
    try {
      const stats = await ownersRepository.getDashboardStats();
      res.json({
        status: "success",
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }
};
