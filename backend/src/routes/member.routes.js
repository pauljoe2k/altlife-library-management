const express = require("express");
const router = express.Router();
const validate = require("../middleware/validate");
const { memberSchema, memberUpdateSchema } = require("../validators/member.validator");
const memberController = require("../controllers/member.controller");

router.get("/", memberController.getMembers);

router.get("/:id", memberController.getMember);

router.post("/", validate(memberSchema), memberController.createMember);

router.put("/:id", validate(memberUpdateSchema), memberController.updateMember);

router.delete("/:id", memberController.deleteMember);

module.exports = router;