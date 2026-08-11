# GroceryMart

Welcome to the GroceryMart project! This application provides a comprehensive solution for catalog and purchase management with a modern tech stack.

## Prerequisites

Before you begin, ensure you have the following installed on your machine:
- [Docker](https://www.docker.com/get-started) and Docker Compose (Recommended)
- [Node.js](https://nodejs.org/) (v18 or higher) - if running locally without Docker

---

## 🚀 Running the Project with Docker (Recommended)

The easiest way to run the entire application (Database, Backend, Frontend, and Adminer) is using Docker Compose.

### 1. Start all services
Run the following command from the root directory of the project:
```bash
docker-compose up -d --build
```
This will start:
- **Frontend** on `http://localhost:5173`
- **Backend API** on `http://localhost:5000`
- **Redis Cache Server** on `http://localhost:6379`
- **PostgreSQL Database** on port `5433` (locally mapped)
- **Adminer** (DB UI) on `http://localhost:8081`

### 2. Setup the Database (Prisma Migrations & Seeding)
Once the containers are running, you need to push the database schema and seed the initial data. You can run these commands directly inside the backend Docker container using `docker-compose exec`:

```bash
# Push the Prisma schema to the database
docker-compose exec backend npm run db:push

# Seed the database with default data (like the Super Admin)
docker-compose exec backend npm run seed
```

> **Default Super Admin Login:**
> - **Email:** `admin@grocerymart.com`
> - **Phone:** `1234567890`
> - **Password:** `admin123`

---

## 💻 Running the Project Locally (Without full Docker)

If you prefer to run the Node.js services locally on your machine while keeping the database in Docker, follow these steps:

### 1. Start only the Database
From the root directory, start just the database and Adminer:
```bash
docker-compose up -d db adminer
```

### 2. Backend Setup
Navigate to the backend directory:
```bash
cd backend
```
Install dependencies:
```bash
npm install
```
Push the schema and seed the database (these commands use `localhost:5433` as defined in package.json):
```bash
npm run db:push
npm run seed
```
Start the development server:
```bash
npm run dev
```
*The backend will run on `http://localhost:5000`.*

### 3. Frontend Setup
Navigate to the frontend directory:
```bash
cd frontend
```
Install dependencies:
```bash
npm install
```
Start the frontend development server:
```bash
npm run dev
```
*The frontend will run on `http://localhost:5173`.*

---

## 📜 Available Commands Quick Reference

### Backend (`/backend`)
| Command | Description |
|---|---|
| `npm run dev` | Starts the backend server using nodemon |
| `npm run db:push` | Syncs Prisma schema with the database |
| `npm run seed` | Seeds the database using `prisma/seed.js` |
| `npm test` | Runs the test suite using Jest |

### Frontend (`/frontend`)
| Command | Description |
|---|---|
| `npm run dev` | Starts the Vite development server |
| `npm run build` | Builds the app for production |
| `npm run lint` | Runs ESLint to check for code issues |
| `npm run preview` | Previews the production build locally |

---

## ⚡ Performance & Caching Optimizations

To handle high traffic concurrency across both the web admin panel and mobile clients, the following optimizations have been built-in:

### 1. Centralized Cache (Redis)
- **Categories Caching:** Caches category tree layouts for **2 minutes** in Redis. The cache is automatically cleared when categories are added, updated, deleted, or imported.
- **Catalog Caching:** Product inventory listings are cached for **1 minute** in Redis. Cache invalidation automatically runs on product creates, updates, deletes, imports, or manual stock adjustments.

### 2. Network Compression (Gzip)
- Express responses are compressed using Gzip compression middleware to reduce outgoing payload sizes by up to **80%**, lowering network transit latency on mobile devices.

### 3. Database Query Indexes
- Added query-specific indexes (`@@index`) to the Prisma schema for all relational foreign keys and filter fields (`storeId`, `categoryId`, `customerId`, `createdAt`, `status`, etc.) in major models to prevent slow, full-table scans.
