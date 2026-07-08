import { usersService } from "./users.service.js";
import { catchAsync } from "../../utils/catchAsync.js";

export class UsersController {
  getUsers = catchAsync(async (req, res) => {
    const result = await usersService.getUsers(req.query);
    res.json({
      success: true,
      data: result.data,
      meta: result.meta,
      message: "Users list retrieved successfully",
    });
  });

  updateUserStatus = catchAsync(async (req, res) => {
    const result = await usersService.updateUserStatus(req.params.id, req.body.status);
    res.json(result);
  });

  updateUser = catchAsync(async (req, res) => {
    const result = await usersService.updateUser(req.params.id, req.body);
    res.json(result);
  });

  deleteUser = catchAsync(async (req, res) => {
    const result = await usersService.deleteUser(req.params.id);
    res.json(result);
  });
}


export const usersController = new UsersController();
