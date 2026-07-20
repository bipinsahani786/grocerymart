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
