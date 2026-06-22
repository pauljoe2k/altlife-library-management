const prisma = require("../config/db");

// Helper to format database book objects to the API presentation schema
const formatBook = (book) => {
  if (!book) return null;
  return {
    bookId: book.book_id,
    title: book.book_name,
    author: book.book_publisher,
    isbn: null,
    totalCopies: null,
  };
};

// Helper to ensure a category and a collection exist in the database
const getOrCreateCategoryAndCollection = async () => {
  let category = await prisma.category.findFirst();
  if (!category) {
    category = await prisma.category.create({
      data: { cat_name: "Default Category", sub_cat_name: "Default Subcategory" },
    });
  }
  let collection = await prisma.collection.findFirst();
  if (!collection) {
    collection = await prisma.collection.create({
      data: { collection_name: "Default Collection" },
    });
  }
  return { catId: category.cat_id, collectionId: collection.collection_id };
};

const getAllBooks = async () => {
  const books = await prisma.book.findMany();
  return books.map(formatBook);
};

const getBookById = async (id) => {
  const book = await prisma.book.findUnique({
    where: { book_id: Number(id) },
  });
  return formatBook(book);
};

const createBook = async (data) => {
  const { catId, collectionId } = await getOrCreateCategoryAndCollection();
  const book = await prisma.book.create({
    data: {
      book_name: data.title,
      book_publisher: data.author,
      book_launch_date: new Date(),
      book_cat_id: catId,
      book_collection_id: collectionId,
    },
  });
  return formatBook(book);
};

const updateBook = async (id, data) => {
  const bookId = Number(id);
  const exists = await prisma.book.findUnique({ where: { book_id: bookId } });
  if (!exists) {
    const error = new Error("Book not found");
    error.statusCode = 404;
    error.name = "NotFoundError";
    throw error;
  }

  const updateData = {};
  if (data.title !== undefined) updateData.book_name = data.title;
  if (data.author !== undefined) updateData.book_publisher = data.author;

  const book = await prisma.book.update({
    where: { book_id: bookId },
    data: updateData,
  });
  return formatBook(book);
};

const deleteBook = async (id) => {
  const bookId = Number(id);
  const exists = await prisma.book.findUnique({ where: { book_id: bookId } });
  if (!exists) {
    const error = new Error("Book not found");
    error.statusCode = 404;
    error.name = "NotFoundError";
    throw error;
  }

  // Check if there are active loans (unreturned)
  const activeLoans = await prisma.issuance.count({
    where: { book_id: bookId, issuance_status: "Issued" },
  });

  if (activeLoans > 0) {
    const error = new Error("Cannot delete a book that is currently issued and not yet returned");
    error.statusCode = 400;
    error.name = "ConstraintError";
    throw error;
  }

  // Safe transactional deletion of historical loans and the book
  await prisma.$transaction(async (tx) => {
    await tx.issuance.deleteMany({
      where: { book_id: bookId },
    });
    await tx.book.delete({
      where: { book_id: bookId },
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