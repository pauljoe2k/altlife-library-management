const Joi = require("joi");

// Schema for book creation (strict and complete)
const bookSchema = Joi.object({
  title: Joi.string().trim().required(),
  author: Joi.string().trim().required(),
  isbn: Joi.string().trim().required(),
  totalCopies: Joi.number().integer().min(1).required(),
});

// Schema for book updates (partial edits allowed, but require at least one field)
const bookUpdateSchema = Joi.object({
  title: Joi.string().trim().optional(),
  author: Joi.string().trim().optional(),
  isbn: Joi.string().trim().optional(),
  totalCopies: Joi.number().integer().min(1).optional(),
}).min(1);

module.exports = {
  bookSchema,
  bookUpdateSchema,
};