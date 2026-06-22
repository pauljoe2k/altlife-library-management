const express = require("express");
const router = express.Router();
const validate = require("../middleware/validate");
const { bookSchema, bookUpdateSchema } = require("../validators/book.validator");

const {
  getBooks,
  getBook,
  createBook,
  updateBook,
  deleteBook,
} = require("../controllers/book.controller");

router.get("/", getBooks);

router.get("/:id", getBook);

router.post("/", validate(bookSchema), createBook);

router.put("/:id", validate(bookUpdateSchema), updateBook);

router.delete("/:id", deleteBook);

module.exports = router;