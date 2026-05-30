const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const prisma = require("./config/db");
const { apiKeyAuth } = require("./middleware/auth");
const errorHandler = require("./middleware/errorHandler");

// Load Environment Variables
dotenv.config();

const app = express();

// Request Logging and Body Parsing
app.use(morgan("dev"));
app.use(express.json());

// Public Routes (Bypass API Key)
app.get("/", (req, res) => {
  res.json({
    status: "success",
    message: "Alt Life Library Management API is running",
    documentation: "/api-docs",
  });
});

// 1. Health Endpoint with Database Connection Check
app.get("/health", async (req, res) => {
  try {
    // Run a fast query to verify PostgreSQL database connectivity
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({
      status: "OK",
      timestamp: new Date().toISOString(),
      database: "connected",
      uptime: process.uptime(),
    });
  } catch (error) {
    res.status(503).json({
      status: "ERROR",
      timestamp: new Date().toISOString(),
      database: "disconnected",
      error: error.message || "Failed to connect to the database",
    });
  }
});

// 2. Swagger Interactive API Documentation
const docsRoutes = require("./routes/docs.routes");
app.use("/api-docs", docsRoutes);

// 3. API Authentication Gateway Middleware (Apply to all /api routes)
app.use("/api", apiKeyAuth);

// 4. Secured Domain Routes
const bookRoutes = require("./routes/book.routes");
const memberRoutes = require("./routes/member.routes");
const issuanceRoutes = require("./routes/issuance.routes");

app.use("/api/books", bookRoutes);
app.use("/api/members", memberRoutes);
app.use("/api/issuances", issuanceRoutes);

// 5. Global Error Handling Middleware (MUST be registered last)
app.use(errorHandler);

// Listen to Port
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`[Server] Running on port ${PORT}`);
  console.log(`[Docs] Interactive Swagger documentation available at http://localhost:${PORT}/api-docs`);
});

// 6. DevOps Graceful Shutdown Handling
const gracefulShutdown = (signal) => {
  console.log(`\n[Process] Received ${signal}. Starting graceful shutdown...`);

  server.close(async () => {
    console.log("[Server] Express HTTP server closed.");
    try {
      await prisma.$disconnect();
      console.log("[Database] Prisma Client disconnected successfully.");
      process.exit(0);
    } catch (err) {
      console.error("[Database] Error during Prisma disconnection:", err);
      process.exit(1);
    }
  });

  // Timeout guard to force termination if operations hang
  setTimeout(() => {
    console.error("[Process] Graceful shutdown timed out, forcing hard termination.");
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

module.exports = { app, server };