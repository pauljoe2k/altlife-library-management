const errorHandler = (err, req, res, next) => {
  console.error("Error encountered:", {
    message: err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    code: err.code,
    meta: err.meta,
  });

  // Handle Prisma Database Errors
  if (err.code) {
    switch (err.code) {
      case "P2002": {
        const target = err.meta?.target ? err.meta.target.join(", ") : "field";
        return res.status(400).json({
          status: "fail",
          error: "Database Error",
          message: `Unique constraint failed: A record with this ${target} already exists.`,
        });
      }
      case "P2025": {
        return res.status(404).json({
          status: "fail",
          error: "Not Found",
          message: err.meta?.cause || "The requested record was not found.",
        });
      }
      case "P2003": {
        return res.status(400).json({
          status: "fail",
          error: "Database Constraint Error",
          message: "Foreign key constraint failed. This action violates database relationships.",
        });
      }
      default:
        break;
    }
  }

  // Handle standard Custom Domain Errors
  const statusCode = err.statusCode || 500;
  const message = err.message || "An unexpected error occurred on the server";

  res.status(statusCode).json({
    status: statusCode === 500 ? "error" : "fail",
    error: err.name || "Server Error",
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

module.exports = errorHandler;
