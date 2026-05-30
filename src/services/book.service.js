const prisma = require("../config/db");

const getAllBooks = async () => {
  return await prisma.book.findMany();
};

const getBookById = async (id) => {
  return await prisma.book.findUnique({
    where: { id: Number(id) },
  });
};

const createBook = async (data) => {
  return await prisma.book.create({
    data,
  });
};

const updateBook = async (id, data) => {
  const bookId = Number(id);
  const exists = await prisma.book.findUnique({ where: { id: bookId } });
  if (!exists) {
    const error = new Error("Book not found");
    error.statusCode = 404;
    error.name = "NotFoundError";
    throw error;
  }

  return await prisma.book.update({
    where: { id: bookId },
    data,
  });
};

const deleteBook = async (id) => {
  const bookId = Number(id);
  const exists = await prisma.book.findUnique({ where: { id: bookId } });
  if (!exists) {
    const error = new Error("Book not found");
    error.statusCode = 404;
    error.name = "NotFoundError";
    throw error;
  }

  // Check if there are active loans (unreturned)
  const activeLoans = await prisma.issuance.count({
    where: { bookId, returnedAt: null },
  });

  if (activeLoans > 0) {
    const error = new Error("Cannot delete a book that is currently issued and not yet returned");
    error.statusCode = 400;
    error.name = "ConstraintError";
    throw error;
  }

  // Safe transactional deletion of historical loans and the book
  return await prisma.$transaction(async (tx) => {
    await tx.issuance.deleteMany({
      where: { bookId },
    });
    return await tx.book.delete({
      where: { id: bookId },
    });
  });
};

module.exports = {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
};