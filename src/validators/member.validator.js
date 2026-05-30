const Joi = require("joi");

// Strict validation schema for creating a new member
const memberSchema = Joi.object({
  name: Joi.string().trim().required(),
  email: Joi.string().trim().email().required(),
  phone: Joi.string().trim().optional().allow("", null),
});

// Flexible validation schema for updating a member (requires at least 1 change)
const memberUpdateSchema = Joi.object({
  name: Joi.string().trim().optional(),
  email: Joi.string().trim().email().optional(),
  phone: Joi.string().trim().optional().allow("", null),
}).min(1);

module.exports = {
  memberSchema,
  memberUpdateSchema,
};