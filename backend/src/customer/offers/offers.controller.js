import { customerOffersService } from "./offers.service.js";

export class CustomerOffersController {
  async getOffers(req, res, next) {
    try {
      const { storeId, pincode } = req.query;
      const data = await customerOffersService.getOffers(storeId, pincode);
      return res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async validateCoupon(req, res, next) {
    try {
      const { code, subtotal, storeId, pincode } = req.body;
      const result = await customerOffersService.validateCoupon(code, subtotal, storeId, pincode);
      return res.json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  }
}

export const customerOffersController = new CustomerOffersController();
