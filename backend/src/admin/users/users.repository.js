import { prisma } from "../../../config/prisma.js";

export class UsersRepository {
  async findUsers(filters, page = 1, limit = 10, search = "") {
    const skip = (page - 1) * limit;
    const parsedLimit = parseInt(limit, 10);
    const parsedPage = parseInt(page, 10);

    const where = { ...filters };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          userType: true,
          walletBalance: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: parsedLimit,
      }),
      prisma.user.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page: parsedPage,
        limit: parsedLimit,
        totalPages: Math.ceil(total / parsedLimit),
      },
    };
  }

  async updateUserStatus(id, status) {
    return await prisma.user.update({
      where: { id },
      data: { status },
      select: { id: true, name: true, email: true, status: true },
    });
  }

  async updateUser(id, data) {
    const { name, email, phone, status, walletBalance } = data;
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (status !== undefined) updateData.status = status;
    if (walletBalance !== undefined) updateData.walletBalance = parseFloat(walletBalance);

    return await prisma.user.update({
      where: { id },
      data: updateData,
    });
  }

  async deleteUser(id) {
    return await prisma.user.delete({
      where: { id },
    });
  }
}


export const usersRepository = new UsersRepository();
