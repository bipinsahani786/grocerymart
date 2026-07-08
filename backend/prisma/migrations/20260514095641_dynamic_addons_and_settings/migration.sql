/*
  Warnings:

  - You are about to drop the column `addon_type` on the `addon_bookings` table. All the data in the column will be lost.
  - Added the required column `addon_name` to the `addon_bookings` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "addon_bookings" DROP COLUMN "addon_type",
ADD COLUMN     "addon_name" TEXT NOT NULL,
ADD COLUMN     "custom_addon_id" TEXT,
ALTER COLUMN "service_level" DROP NOT NULL;

-- CreateTable
CREATE TABLE "system_settings" (
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "description" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_settings_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "custom_addons" (
    "id" TEXT NOT NULL,
    "parking_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DECIMAL(65,30) NOT NULL,
    "image" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "custom_addons_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "custom_addons" ADD CONSTRAINT "custom_addons_parking_id_fkey" FOREIGN KEY ("parking_id") REFERENCES "parkings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "addon_bookings" ADD CONSTRAINT "addon_bookings_custom_addon_id_fkey" FOREIGN KEY ("custom_addon_id") REFERENCES "custom_addons"("id") ON DELETE SET NULL ON UPDATE CASCADE;
