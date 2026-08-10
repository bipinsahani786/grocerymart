#!/bin/sh
# GroceryMart Backend Startup Script
# Runs after Docker healthcheck ensures PostgreSQL is ready

set -e

echo "🚀 GroceryMart Backend Starting..."
echo "📅 $(date)"

# Run database schema push (safe — idempotent)
echo ""
echo "🔄 Applying Prisma schema to database..."
npx prisma db push --accept-data-loss
echo "✅ Schema applied successfully!"

# Seed the database (all upserts — safe to run multiple times)
echo ""
echo "🌱 Seeding database with initial data..."
node prisma/seed.js
echo "✅ Database seeded!"

# Start the backend server
echo ""
echo "🟢 Starting GroceryMart Express server on port ${PORT:-5000}..."
exec node index.js
