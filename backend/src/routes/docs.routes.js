const express = require("express");
const router = express.Router();
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("../docs/swagger.json");

// Serve Swagger UI assets
router.use("/", swaggerUi.serve);

// Set up Swagger UI page with our OpenAPI configuration
router.get("/", swaggerUi.setup(swaggerDocument));

module.exports = router;
