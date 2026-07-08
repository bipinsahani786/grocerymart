import { prisma } from "../../../config/prisma.js";
import { catchAsync } from "../../utils/catchAsync.js";

export class DbController {
  getAddonBookings = catchAsync(async (req, res) => {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const search = req.query.search || "";
    const status = req.query.status || "";

    const skip = (page - 1) * limit;
    const where = {};

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { addonName: { contains: search, mode: "insensitive" } },
        { serviceLevel: { contains: search, mode: "insensitive" } },
        { booking: { user: { name: { contains: search, mode: "insensitive" } } } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.addonBooking.findMany({
        where,
        include: {
          booking: {
            include: {
              user: { select: { name: true, phone: true, email: true } },
              parking: { select: { name: true } },
            },
          },
          customAddon: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.addonBooking.count({ where }),
    ]);

    res.json({
      success: true,
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  });

  getCustomAddons = catchAsync(async (req, res) => {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const search = req.query.search || "";
    const skip = (page - 1) * limit;
    const where = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.customAddon.findMany({
        where,
        include: {
          parking: { select: { name: true, address: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.customAddon.count({ where }),
    ]);

    res.json({
      success: true,
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  });

  getPricingRules = catchAsync(async (req, res) => {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const search = req.query.search || "";
    const skip = (page - 1) * limit;
    const where = {};

    if (search) {
      where.parking = {
        name: { contains: search, mode: "insensitive" },
      };
    }

    const [data, total] = await Promise.all([
      prisma.pricingRule.findMany({
        where,
        include: {
          parking: { select: { name: true, address: true } },
        },
        skip,
        take: limit,
      }),
      prisma.pricingRule.count({ where }),
    ]);

    res.json({
      success: true,
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  });

  getVehicles = catchAsync(async (req, res) => {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const search = req.query.search || "";
    const skip = (page - 1) * limit;

    const where = {};
    if (search) {
      where.OR = [
        { regNumber: { contains: search, mode: "insensitive" } },
        { vehicleType: { contains: search, mode: "insensitive" } },
        { user: { name: { contains: search, mode: "insensitive" } } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.vehicle.findMany({
        where,
        include: {
          user: { select: { name: true, email: true, phone: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.vehicle.count({ where }),
    ]);

    res.json({
      success: true,
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  });

  getPayouts = catchAsync(async (req, res) => {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const search = req.query.search || "";
    const skip = (page - 1) * limit;

    const where = {};
    if (search) {
      where.user = {
        name: { contains: search, mode: "insensitive" },
      };
    }

    const [data, total] = await Promise.all([
      prisma.payout.findMany({
        where,
        include: {
          user: { select: { name: true, email: true, phone: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.payout.count({ where }),
    ]);

    res.json({
      success: true,
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  });

  getParkingSlots = catchAsync(async (req, res) => {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const search = req.query.search || "";
    const skip = (page - 1) * limit;

    const where = {};
    if (search) {
      where.parking = {
        name: { contains: search, mode: "insensitive" },
      };
    }

    const [data, total] = await Promise.all([
      prisma.parkingSlot.findMany({
        where,
        include: {
          parking: { select: { name: true, address: true } },
        },
        skip,
        take: limit,
      }),
      prisma.parkingSlot.count({ where }),
    ]);

    res.json({
      success: true,
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  });

  getGisMetadata = catchAsync(async (req, res) => {
    let geography_columns = [];
    let geometry_columns = [];
    let spatial_ref_sys = [];

    // Safe execution of raw spatial system tables
    try {
      geography_columns = await prisma.$queryRawUnsafe("SELECT * FROM geography_columns LIMIT 50;");
    } catch (e) {
      console.warn("Could not query geography_columns view. It might not be loaded.", e.message);
    }

    try {
      geometry_columns = await prisma.$queryRawUnsafe("SELECT * FROM geometry_columns LIMIT 50;");
    } catch (e) {
      console.warn("Could not query geometry_columns view. It might not be loaded.", e.message);
    }

    try {
      spatial_ref_sys = await prisma.$queryRawUnsafe("SELECT * FROM spatial_ref_sys LIMIT 50;");
    } catch (e) {
      console.warn("Could not query spatial_ref_sys table. It might not be loaded.", e.message);
    }

    res.json({
      success: true,
      data: {
        geography_columns,
        geometry_columns,
        spatial_ref_sys,
      },
    });
  });
}

export const dbController = new DbController();
