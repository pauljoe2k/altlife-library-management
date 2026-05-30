const prisma = require("../config/db");

const getAllIssuances = async () => {
  return await prisma.issuance.findMany({
    include: {
      member: true,
      book: true,
    },
  });
};

const getIssuanceById = async (id) => {
  const issuanceId = Number(id);
  return await prisma.issuance.findUnique({
    where: { id: issuanceId },
    include: {
      member: true,
      book: true,
    },
  });
};

const createIssuance = async (data) => {
  const memberId = Number(data.memberId);
  const bookId = Number(data.bookId);
  const dueDate = new Date(data.dueDate);

  // 1. Verify member exists
  const member = await prisma.member.findUnique({ where: { id: memberId } });
  if (!member) {
    const error = new Error(`Member with ID ${memberId} not found`);
    error.statusCode = 404;
    error.name = "NotFoundError";
    throw error;
  }

  // 2. Verify book exists
  const book = await prisma.book.findUnique({ where: { id: bookId } });
  if (!book) {
    const error = new Error(`Book with ID ${bookId} not found`);
    error.statusCode = 404;
    error.name = "NotFoundError";
    throw error;
  }

  // 3. Prevent issuance if no copies available (out of stock)
  const activeLoansCount = await prisma.issuance.count({
    where: {
      bookId,
      returnedAt: null,
    },
  });

  if (activeLoansCount >= book.totalCopies) {
    const error = new Error(
      `All copies of "${book.title}" are currently issued (${activeLoansCount}/${book.totalCopies} copies outstanding).`
    );
    error.statusCode = 400;
    error.name = "OutOfStockError";
    throw error;
  }

  // 4. Create issuance
  return await prisma.issuance.create({
    data: {
      memberId,
      bookId,
      dueDate,
    },
    include: {
      member: true,
      book: true,
    },
  });
};

const returnBook = async (id) => {
  const issuanceId = Number(id);

  // 1. Check if the issuance exists
  const issuance = await prisma.issuance.findUnique({
    where: { id: issuanceId },
  });

  if (!issuance) {
    const error = new Error(`Issuance record with ID ${issuanceId} not found`);
    error.statusCode = 404;
    error.name = "NotFoundError";
    throw error;
  }

  // 2. Prevent duplicate returns
  if (issuance.returnedAt !== null) {
    const error = new Error(`Book from issuance ID ${issuanceId} has already been returned at ${issuance.returnedAt.toISOString()}`);
    error.statusCode = 400;
    error.name = "DuplicateReturnError";
    throw error;
  }

  // 3. Track returnedAt correctly
  return await prisma.issuance.update({
    where: {
      id: issuanceId,
    },
    data: {
      returnedAt: new Date(),
    },
    include: {
      member: true,
      book: true,
    },
  });
};

module.exports = {
  getAllIssuances,
  getIssuanceById,
  createIssuance,
  returnBook,
};