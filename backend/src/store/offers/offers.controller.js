import { offersService } from "./offers.service.js";
import { catchAsync } from "../../utils/catchAsync.js";

export class OffersController {
  getOffers = catchAsync(async (req, res) => {
    const { storeId, page, limit, search } = req.query;
    const result = await offersService.getOffers(req.user, storeId, page, limit, search);
    res.json(result);
  });

  createOffer = catchAsync(async (req, res) => {
    const result = await offersService.createOffer(req.user, req.query.storeId, req.body);
    res.status(201).json(result);
  });

  updateOffer = catchAsync(async (req, res) => {
    const result = await offersService.updateOffer(req.user, req.query.storeId, req.params.id, req.body);
    res.json(result);
  });

  deleteOffer = catchAsync(async (req, res) => {
    const result = await offersService.deleteOffer(req.user, req.query.storeId, req.params.id);
    res.json(result);
  });
}

export const offersController = new OffersController();
