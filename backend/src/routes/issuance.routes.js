const express = require("express");
const router = express.Router();
const validate = require("../middleware/validate");
const { issuanceSchema, issuanceUpdateSchema } = require("../validators/issuance.validator");

const {
  getIssuances,
  getIssuance,
  createIssuance,
  returnBook,
  updateIssuance,
  deleteIssuance,
} = require("../controllers/issuance.controller");

router.get("/", getIssuances);

router.get("/:id", getIssuance);

router.post("/", validate(issuanceSchema), createIssuance);

router.put("/:id/return", returnBook);

router.put("/:id", validate(issuanceUpdateSchema), updateIssuance);

router.delete("/:id", deleteIssuance);

module.exports = router;