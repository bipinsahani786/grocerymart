-- CreateExtension
CREATE EXTENSION IF NOT EXISTS postgis;

-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('driver', 'owner', 'admin');

-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('super_admin', 'ops_staff');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('active', 'suspended', 'banned');

-- CreateEnum
CREATE TYPE "OwnerType" AS ENUM ('home', 'society', 'commercial', 'govt', 'municipality');

-- CreateEnum
CREATE TYPE "VehicleType" AS ENUM ('bike', 'car', 'commercial');

-- CreateEnum
CREATE TYPE "ParkingType" AS ENUM ('home', 'society', 'commercial', 'govt', 'municipality');

-- CreateEnum
CREATE TYPE "ParkingStatus" AS ENUM ('pending', 'active', 'paused', 'banned');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('confirmed', 'active', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "WalletTxnType" AS ENUM ('credit', 'debit', 'refund', 'overstay_charge', 'payout');

-- CreateEnum
CREATE TYPE "PayoutStatus" AS ENUM ('pending', 'processing', 'transferred', 'failed');

-- CreateEnum
CREATE TYPE "DisputeStatus" AS ENUM ('open', 'reviewing', 'resolved');

-- CreateEnum
CREATE TYPE "DisputeResolution" AS ENUM ('full_refund', 'partial_refund', 'no_refund', 'owner_penalty');

-- CreateEnum
CREATE TYPE "AddonType" AS ENUM ('car_wash', 'ev_charging', 'tyre_inflation');

-- CreateEnum
CREATE TYPE "AddonStatus" AS ENUM ('pending', 'in_progress', 'completed');

-- CreateEnum
CREATE TYPE "ReviewTargetType" AS ENUM ('parking', 'addon');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "password_hash" TEXT,
    "name" TEXT,
    "user_type" "UserType" NOT NULL,
    "admin_role" "AdminRole",
    "wallet_balance" DECIMAL(65,30) NOT NULL DEFAULT 0.0,
    "status" "UserStatus" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "owner_profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "owner_type" "OwnerType" NOT NULL,
    "bank_account" TEXT,
    "bank_ifsc" TEXT,
    "account_holder_name" TEXT,
    "gst_number" TEXT,
    "strike_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "owner_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "vehicle_type" "VehicleType" NOT NULL,
    "reg_number" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parkings" (
    "id" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "parking_type" "ParkingType" NOT NULL,
    "address" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "location" geography(Point, 4326),
    "photos" TEXT[],
    "open_time" TEXT NOT NULL,
    "close_time" TEXT NOT NULL,
    "is_24hr" BOOLEAN NOT NULL DEFAULT false,
    "status" "ParkingStatus" NOT NULL DEFAULT 'pending',
    "avg_rating" DECIMAL(65,30) NOT NULL DEFAULT 0.0,
    "addons_enabled" TEXT[],
    "is_full" BOOLEAN NOT NULL DEFAULT false,
    "is_closed" BOOLEAN NOT NULL DEFAULT false,
    "reopen_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "parkings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parking_slots" (
    "id" TEXT NOT NULL,
    "parking_id" TEXT NOT NULL,
    "vehicle_type" "VehicleType" NOT NULL,
    "total_slots" INTEGER NOT NULL,
    "available_slots" INTEGER NOT NULL,

    CONSTRAINT "parking_slots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pricing_rules" (
    "id" TEXT NOT NULL,
    "parking_id" TEXT NOT NULL,
    "vehicle_type" "VehicleType" NOT NULL,
    "weekday_price" DECIMAL(65,30) NOT NULL,
    "weekend_price" DECIMAL(65,30) NOT NULL,
    "peak_rules" JSONB,

    CONSTRAINT "pricing_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookings" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "parking_id" TEXT NOT NULL,
    "vehicle_type" "VehicleType" NOT NULL,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3) NOT NULL,
    "actual_end" TIMESTAMP(3),
    "gross_amount" DECIMAL(65,30) NOT NULL,
    "commission" DECIMAL(65,30) NOT NULL,
    "owner_share" DECIMAL(65,30) NOT NULL,
    "overstay_amount" DECIMAL(65,30) NOT NULL DEFAULT 0.0,
    "total_charged" DECIMAL(65,30) NOT NULL,
    "status" "BookingStatus" NOT NULL,
    "checkin_at" TIMESTAMP(3),
    "checkout_at" TIMESTAMP(3),
    "qr_token" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wallet_txns" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" "WalletTxnType" NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "reference_id" TEXT,
    "reference_type" TEXT,
    "description" TEXT NOT NULL,
    "balance_after" DECIMAL(65,30) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wallet_txns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payouts" (
    "id" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "week_start" DATE NOT NULL,
    "week_end" DATE NOT NULL,
    "gross_amount" DECIMAL(65,30) NOT NULL,
    "commission" DECIMAL(65,30) NOT NULL,
    "net_amount" DECIMAL(65,30) NOT NULL,
    "dispute_hold" DECIMAL(65,30) NOT NULL DEFAULT 0.0,
    "final_payout" DECIMAL(65,30) NOT NULL,
    "status" "PayoutStatus" NOT NULL DEFAULT 'pending',
    "utr_number" TEXT,
    "processed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payouts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "disputes" (
    "id" TEXT NOT NULL,
    "booking_id" TEXT NOT NULL,
    "raised_by_id" TEXT NOT NULL,
    "raised_by_type" "UserType" NOT NULL,
    "reason" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "DisputeStatus" NOT NULL DEFAULT 'open',
    "resolution" "DisputeResolution",
    "refund_amount" DECIMAL(65,30),
    "admin_note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved_at" TIMESTAMP(3),

    CONSTRAINT "disputes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "addon_bookings" (
    "id" TEXT NOT NULL,
    "booking_id" TEXT NOT NULL,
    "addon_type" "AddonType" NOT NULL,
    "service_level" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "commission" DECIMAL(65,30) NOT NULL,
    "owner_share" DECIMAL(65,30) NOT NULL,
    "status" "AddonStatus" NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "addon_bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" TEXT NOT NULL,
    "booking_id" TEXT NOT NULL,
    "reviewer_id" TEXT NOT NULL,
    "target_id" TEXT NOT NULL,
    "target_type" "ReviewTargetType" NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "owner_profiles_user_id_key" ON "owner_profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "parking_slots_parking_id_vehicle_type_key" ON "parking_slots"("parking_id", "vehicle_type");

-- CreateIndex
CREATE UNIQUE INDEX "pricing_rules_parking_id_vehicle_type_key" ON "pricing_rules"("parking_id", "vehicle_type");

-- CreateIndex
CREATE UNIQUE INDEX "bookings_qr_token_key" ON "bookings"("qr_token");

-- AddForeignKey
ALTER TABLE "owner_profiles" ADD CONSTRAINT "owner_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parkings" ADD CONSTRAINT "parkings_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parking_slots" ADD CONSTRAINT "parking_slots_parking_id_fkey" FOREIGN KEY ("parking_id") REFERENCES "parkings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pricing_rules" ADD CONSTRAINT "pricing_rules_parking_id_fkey" FOREIGN KEY ("parking_id") REFERENCES "parkings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_parking_id_fkey" FOREIGN KEY ("parking_id") REFERENCES "parkings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallet_txns" ADD CONSTRAINT "wallet_txns_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payouts" ADD CONSTRAINT "payouts_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disputes" ADD CONSTRAINT "disputes_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disputes" ADD CONSTRAINT "disputes_raised_by_id_fkey" FOREIGN KEY ("raised_by_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "addon_bookings" ADD CONSTRAINT "addon_bookings_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_reviewer_id_fkey" FOREIGN KEY ("reviewer_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
