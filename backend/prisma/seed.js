import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create a default superadmin user
  const passwordHash = await bcrypt.hash("admin123", 10);

  const superadmin = await prisma.user.upsert({
    where: { email: "admin@grocerymart.com" },
    update: {},
    create: {
      email: "admin@grocerymart.com",
      phone: "1234567890",
      passwordHash,
      name: "Super Admin",
      status: "active",
      role: {
        create: {
          roleName: "super_admin",
          role: "SUPER_ADMIN"
        }
      }
    },
  });

  console.log({ superadmin });

  // Get first store, or create one if none exists
  let store = await prisma.store.findFirst();
  if (!store) {
    console.log("No store found. Creating default retail store...");
    store = await prisma.store.create({
      data: {
        name: "GroceryMart Noida Outlet",
        address: "Sector 62, Noida, UP, India",
        lat: 28.6273,
        long: 77.3725,
        radiusKm: 5.0,
        phone: "9876543210",
        openingTime: "08:00",
        closingTime: "22:00",
      }
    });
  }

  // Create 50 Offers
  console.log("Generating 50 coupon offers...");
  for (let i = 1; i <= 50; i++) {
    const code = `PROMO${i}`;
    await prisma.storeOffer.upsert({
      where: { storeId_code: { storeId: store.id, code } },
      update: {},
      create: {
        storeId: store.id,
        code,
        description: `Get flat ₹${i * 10} discount on orders above ₹${i * 100}`,
        discountType: "FLAT",
        discountValue: i * 10,
        minOrderValue: i * 100,
        isActive: i % 5 !== 0, // Mark some as inactive
      }
    });
  }

  // Create 50 Subscription plans
  console.log("Generating 50 subscription plans...");
  for (let i = 1; i <= 50; i++) {
    const name = `VIP Club Pass ${i}`;
    const existingSub = await prisma.storeSubscriptionPlan.findFirst({
      where: { storeId: store.id, name }
    });
    if (!existingSub) {
      await prisma.storeSubscriptionPlan.create({
        data: {
          storeId: store.id,
          name,
          description: `VIP membership level ${i} pass. Unlock premium benefits.`,
          price: 99 + (i * 20),
          durationDays: i * 10,
          isActive: i % 6 !== 0,
          features: [
            `Free home delivery within ${3 + (i % 5)} KM`,
            `${2 + (i % 3)}% extra billing discount`,
            "Priority support line access"
          ]
        }
      });
    }
  }

  console.log("Seeding finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
