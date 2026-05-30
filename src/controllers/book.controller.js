const bookService = require("../services/book.service");
const asyncHandler = require("../utils/asyncHandler");

const getBooks = asyncHandler(async (req, res) => {
  const books = await bookService.getAllBooks();
  res.json({
    status: "success",
    results: books.length,
    data: books,
  });
});

const getBook = asyncHandler(async (req, res) => {
  const book = await bookService.getBookById(req.params.id);

  if (!book) {
    return res.status(404).json({
      status: "fail",
      error: "NotFoundError",
      message: "Book not found",
    });
  }

  res.json({
    status: "success",
    data: book,
  });
});

const createBook = asyncHandler(async (req, res) => {
  const newBook = await bookService.createBook(req.body);

  res.status(201).json({
    status: "success",
    message: "Book created successfully",
    data: newBook,
  });
});

const updateBook = asyncHandler(async (req, res) => {
  const updatedBook = await bookService.updateBook(req.params.id, req.body);

  res.json({
    status: "success",
    message: "Book updated successfully",
    data: updatedBook,
  });
});

const deleteBook = asyncHandler(async (req, res) => {
  await bookService.deleteBook(req.params.id);

  res.json({
    status: "success",
    message: "Book deleted successfully",
  });
});

module.exports = {
  getBooks,
  getBook,
  createBook,
  updateBook,
  deleteBook,
};