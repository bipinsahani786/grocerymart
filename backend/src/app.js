import express from "express";
import cors from "cors";
import path from "path";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "../config/swagger.js";
import authRoutes from "./common/auth/auth.routes.js";
import uploadRoutes from "./common/upload/upload.routes.js";
import adminRoutes from "./admin/index.js";

const app = express();

// Auto-inject secure HTTP Response Headers against standard injection vectors
app.use(helmet({
  contentSecurityPolicy: false,
  hsts: false,
}));

// Cross-Origin Resource Sharing layer
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"],
  credentials: true
}));

// Parse structured incoming JSON payloads
app.use(express.json());

// Serve static files (avatars, images, etc.)
app.use(express.static(path.join(process.cwd(), "public")));

// Console stream HTTP Request/Response logger
app.use(morgan("dev"));

// DDoS and Brute-Force prevention interceptor limiting IP request quotas
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 1000, // Increased to 1000 for development/dashboard polling
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    status: "error",
    message: "Too many requests originating from this IP address. Please wait 15 minutes before retrying.",
  },
});

// OpenAPI Interactive Documentation Interface viewable via web clients
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Mount Core Application Slices
app.use("/api/auth", authRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/admin", adminRoutes);

// Platform System Readiness Check Endpoint
app.get("/", (req, res) => {
  res.json({
    status: "success",
    message: "Production-ready Modular Backend running securely 🚀",
    docs: "/api-docs",
  });
});

// Centralized Unhandled Exception Interceptor
app.use((err, req, res, next) => {
  console.error("Global Error Interceptor Log:", err);
  res.status(err.status || 500).json({
    status: "error",
    message: err.message || "Internal Server Error",
  });
});

export default app;
