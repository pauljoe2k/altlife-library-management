const Joi = require("joi");

// Issuance creation validation schema
const issuanceSchema = Joi.object({
  memberId: Joi.number().integer().positive().required(),
  bookId: Joi.number().integer().positive().required(),
  dueDate: Joi.date().greater("now").required().messages({
    "date.greater": "Due date must be a future date",
    "any.required": "Due date is required",
  }),
});

// Issuance update validation schema
const issuanceUpdateSchema = Joi.object({
  memberId: Joi.number().integer().positive().optional(),
  bookId: Joi.number().integer().positive().optional(),
  dueDate: Joi.date().greater("now").optional(),
  status: Joi.string().optional(),
}).min(1);

module.exports = {
  issuanceSchema,
  issuanceUpdateSchema,
};