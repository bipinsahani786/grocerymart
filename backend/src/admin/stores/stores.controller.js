import { storesService } from "./stores.service.js";
import { catchAsync } from "../../utils/catchAsync.js";

export class StoresController {
  getStores = catchAsync(async (req, res) => {
    const result = await storesService.getStores(req.query);
    res.json(result);
  });

  createStore = catchAsync(async (req, res) => {
    const result = await storesService.createStore(req.body);
    res.status(201).json(result);
  });
}

export const storesController = new StoresController();
