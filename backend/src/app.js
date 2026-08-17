import express from "express";
import cors from "cors";
import path from "path";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import compression from "compression";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "../config/swagger.js";
import authRoutes from "./common/auth/auth.routes.js";
import uploadRoutes from "./common/upload/upload.routes.js";
import adminRoutes from "./admin/index.js";
import storeRoutes from "./store/index.js";
import customerRoutes from "./customer/customer.routes.js";

const app = express();

// Enable Gzip/Deflate response compression
app.use(compression());

// Auto-inject secure HTTP Response Headers against standard injection vectors
app.use(helmet({
  contentSecurityPolicy: false,
  hsts: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));

// ✅ FIX: CORS — restrict to allowed origins via env variable in production
const getAllowedOrigins = () => {
  const envOrigins = process.env.CORS_ORIGIN;
  if (!envOrigins) return true; // Dev fallback: allow all
  return envOrigins.split(",").map((o) => o.trim());
};

app.use(cors({
  origin: (origin, callback) => {
    const allowed = getAllowedOrigins();
    // Allow all (dev mode or CORS_ORIGIN not set)
    if (allowed === true) return callback(null, true);
    // Allow requests with no origin (mobile apps, Postman, server-to-server)
    if (!origin) return callback(null, true);
    if (allowed.includes(origin)) return callback(null, true);
    return callback(new Error(`CORS policy: Origin ${origin} is not allowed`));
  },
  credentials: true,
}));

// Parse structured incoming JSON payloads with 50mb limit for Data URL image uploads
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Serve static files (avatars, images, etc.)
app.use(express.static(path.join(process.cwd(), "public")));

// Console stream HTTP Request/Response logger
app.use(morgan("dev"));

// ✅ FIX: Separate rate limiters — stricter for auth, lenient for dashboard polling

// Auth endpoints: 10 requests per 15 minutes per IP (prevents brute force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting in development/test environments
    return process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test";
  },
  message: {
    status: "error",
    code: "RATE_LIMITED",
    message: "Too many authentication attempts. Please wait 15 minutes before retrying.",
  },
});

// General API endpoints: 500 requests per 15 minutes per IP
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 500,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    status: "error",
    code: "RATE_LIMITED",
    message: "Too many requests from this IP address. Please wait 15 minutes before retrying.",
  },
});

// OpenAPI Interactive Documentation Interface
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Mount Core Application Slices
app.use("/api/auth", authLimiter, authRoutes);           // ✅ Auth gets stricter limiter
app.use("/api/upload", apiLimiter, uploadRoutes);
app.use("/api/admin", apiLimiter, adminRoutes);
app.use("/api/store", apiLimiter, storeRoutes);
app.use("/api/customer", apiLimiter, customerRoutes);

// Platform System Readiness Check Endpoint
app.get("/", (req, res) => {
  res.json({
    status: "success",
    message: "Production-ready Modular Backend running securely 🚀",
    docs: "/api-docs",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

// Centralized Unhandled Exception Interceptor
app.use((err, req, res, next) => {
  console.error("Global Error Interceptor:", err);

  // ✅ CORS error handling
  if (err.message && err.message.startsWith("CORS policy:")) {
    return res.status(403).json({
      status: "error",
      code: "CORS_BLOCKED",
      message: err.message,
    });
  }

  let statusCode = err.status || err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  // Catch Prisma runtime or validation errors gracefully
  if (err.name === "PrismaClientValidationError" || err.code?.startsWith("P")) {
    statusCode = 400;
    if (err.name === "PrismaClientValidationError") {
      message = "Invalid input value provided for database operation";
    } else if (err.code === "P2002") {
      statusCode = 409;
      const target = err.meta?.target;
      const field = Array.isArray(target) ? target.join(", ") : "field";
      message = `A record with this ${field} already exists`;
    } else if (err.code === "P2025") {
      statusCode = 404;
      message = "Record not found";
    } else if (err.code === "P2003") {
      statusCode = 400;
      message = "Invalid reference: related record does not exist";
    } else {
      message = "Database operation failed due to invalid request data";
    }
  }

  // Don't leak stack traces to clients in production
  const response = {
    status: "error",
    message,
  };

  if (process.env.NODE_ENV === "development") {
    response.stack = err.stack;
    response.code = err.code;
  }

  res.status(statusCode).json(response);
});

export default app;
