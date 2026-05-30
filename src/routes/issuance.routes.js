const express = require("express");
const router = express.Router();
const validate = require("../middleware/validate");
const { issuanceSchema } = require("../validators/issuance.validator");

const {
  getIssuances,
  getIssuance,
  createIssuance,
  returnBook,
} = require("../controllers/issuance.controller");

router.get("/", getIssuances);

router.get("/:id", getIssuance);

router.post("/", validate(issuanceSchema), createIssuance);

router.put("/:id/return", returnBook);

module.exports = router;