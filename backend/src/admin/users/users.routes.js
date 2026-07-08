import express from "express";
import { usersController } from "./users.controller.js";
import { validate } from "../../middleware/validate.middleware.js";
import { updateUserStatusSchema } from "./users.schema.js";

const router = express.Router();

/**
 * @openapi
 * /api/admin/users:
 *   get:
 *     summary: Super Admin - List All Users
 *     description: Retrieve all registered users across the platform with optional filtering by userType and status.
 *     tags: [Admin User Management]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: userType
 *         schema: { type: string, enum: [driver, owner, admin] }
 *         example: "driver"
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [active, suspended, banned] }
 *         example: "active"
 *     responses:
 *       200:
 *         description: Users list retrieved successfully
 */
router.get("/", usersController.getUsers);

/**
 * @openapi
 * /api/admin/users/{id}/status:
 *   put:
 *     summary: Super Admin - Suspend or Ban User
 *     description: Update the account operational status of any user across the platform.
 *     tags: [Admin User Management]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status: { type: string, enum: [active, suspended, banned], example: "suspended" }
 *     responses:
 *       200:
 *         description: User status updated successfully
 */
router.put("/:id/status", validate(updateUserStatusSchema), usersController.updateUserStatus);

/**
 * @openapi
 * /api/admin/users/{id}:
 *   put:
 *     summary: Super Admin - Update User Profile
 *     description: Update basic profile information for any user on the platform.
 *     tags: [Admin User Management]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: User profile updated successfully
 */
router.put("/:id", usersController.updateUser);

/**
 * @openapi
 * /api/admin/users/{id}:
 *   delete:
 *     summary: Super Admin - Delete User Account
 *     description: Permanently delete a user account and all their associated data.
 *     tags: [Admin User Management]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: User account deleted successfully
 */
router.delete("/:id", usersController.deleteUser);


export default router;
