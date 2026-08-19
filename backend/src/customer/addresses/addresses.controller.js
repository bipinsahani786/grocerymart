import { customerAddressesService } from "./addresses.service.js";
import { catchAsync } from "../../utils/catchAsync.js";

export class CustomerAddressesController {
  getProfile = catchAsync(async (req, res) => {
    const profile = await customerAddressesService.getProfile(req.user, req.query);
    res.json({
      success: true,
      data: profile,
    });
  });

  getAddresses = catchAsync(async (req, res) => {
    const addresses = await customerAddressesService.getAddresses(req.user, req.query);
    res.json({
      success: true,
      data: addresses,
    });
  });

  addAddress = catchAsync(async (req, res) => {
    const { street, city, state, zipCode } = req.body;
    if (!street || !zipCode) {
      return res.status(400).json({
        success: false,
        message: "Street and zipCode are required.",
      });
    }

    const address = await customerAddressesService.addAddress(req.user, req.body);

    res.status(201).json({
      success: true,
      message: "Address saved successfully.",
      data: address,
    });
  });

  updateAddress = catchAsync(async (req, res) => {
    const { id } = req.params;
    const address = await customerAddressesService.updateAddress(id, req.body, req.user);
    res.json({
      success: true,
      message: "Address updated successfully.",
      data: address,
    });
  });

  deleteAddress = catchAsync(async (req, res) => {
    const { id } = req.params;
    await customerAddressesService.deleteAddress(id);
    res.json({
      success: true,
      message: "Address deleted successfully.",
    });
  });
}

export const customerAddressesController = new CustomerAddressesController();
