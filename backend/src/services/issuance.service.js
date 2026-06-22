const prisma = require("../config/db");

// Helper to format issuance response
const formatIssuance = (iss) => {
  if (!iss) return null;

  return {
    id: iss.issuance_id,
    memberId: iss.membership?.member?.mem_id ?? null,
    bookId: iss.book_id,
    issuedAt: iss.issuance_date,
    dueDate: iss.target_return_date,
    status: iss.issuance_status,

    member: iss.membership?.member
      ? {
          memberId: iss.membership.member.mem_id,
          name: iss.membership.member.mem_name,
          email: iss.membership.member.mem_email,
          phone: iss.membership.member.mem_phone,
        }
      : null,

    book: iss.book
      ? {
          bookId: iss.book.book_id,
          title: iss.book.book_name,
          author: iss.book.book_publisher,
          isbn: null,
          totalCopies: null,
        }
      : null,
  };
};

const getAllIssuances = async () => {
  const issuances = await prisma.issuance.findMany({
    include: {
      book: true,
      membership: {
        include: {
          member: true,
        },
      },
    },
  });

  return issuances.map(formatIssuance);
};

const getIssuanceById = async (id) => {
  const issuance = await prisma.issuance.findUnique({
    where: { issuance_id: Number(id) },
    include: {
      book: true,
      membership: {
        include: {
          member: true,
        },
      },
    },
  });

  return formatIssuance(issuance);
};

const createIssuance = async (data) => {
  const memberId = Number(data.memberId);
  const bookId = Number(data.bookId);
  const dueDate = new Date(data.dueDate);

  // get member
  const member = await prisma.member.findUnique({
    where: { mem_id: memberId },
    include: { memberships: true },
  });

  if (!member || !member.memberships.length) {
    const error = new Error("Member or Membership not found");
    error.statusCode = 404;
    throw error;
  }

  const membership = member.memberships[0];

  // get book
  const book = await prisma.book.findUnique({
    where: { book_id: bookId },
  });

  if (!book) {
    const error = new Error("Book not found");
    error.statusCode = 404;
    throw error;
  }

  // stock check
  const activeLoans = await prisma.issuance.count({
    where: {
      book_id: bookId,
      issuance_status: "Issued",
    },
  });

  if (activeLoans >= 5) {
    const error = new Error("Book out of stock");
    error.statusCode = 400;
    throw error;
  }

  const issuance = await prisma.issuance.create({
    data: {
      membership_id: membership.membership_id,
      book_id: bookId,
      target_return_date: dueDate,
      issued_by: "Admin",
      issuance_status: "Issued",
    },
    include: {
      book: true,
      membership: {
        include: { member: true },
      },
    },
  });

  return formatIssuance(issuance);
};

const returnBook = async (id) => {
  const issuance = await prisma.issuance.findUnique({
    where: { issuance_id: Number(id) },
  });

  if (!issuance) {
    const error = new Error("Issuance not found");
    error.statusCode = 404;
    throw error;
  }

  if (issuance.issuance_status === "Returned") {
    const error = new Error("Already returned");
    error.statusCode = 400;
    throw error;
  }

  const updated = await prisma.issuance.update({
    where: { issuance_id: Number(id) },
    data: {
      issuance_status: "Returned",
    },
    include: {
      book: true,
      membership: {
        include: { member: true },
      },
    },
  });

  return formatIssuance(updated);
};

const updateIssuance = async (id, data) => {
  const updateData = {};

  if (data.memberId) {
    const member = await prisma.member.findUnique({
      where: { mem_id: Number(data.memberId) },
      include: { memberships: true },
    });

    if (!member || !member.memberships.length) {
      throw new Error("Member not found");
    }

    updateData.membership_id = member.memberships[0].membership_id;
  }

  if (data.bookId) {
    updateData.book_id = Number(data.bookId);
  }

  if (data.dueDate) {
    updateData.target_return_date = new Date(data.dueDate);
  }

  if (data.status) {
    updateData.issuance_status = data.status;
  }

  const updated = await prisma.issuance.update({
    where: { issuance_id: Number(id) },
    data: updateData,
    include: {
      book: true,
      membership: {
        include: { member: true },
      },
    },
  });

  return formatIssuance(updated);
};

const deleteIssuance = async (id) => {
  await prisma.issuance.delete({
    where: { issuance_id: Number(id) },
  });
};

module.exports = {
  getAllIssuances,
  getIssuanceById,
  createIssuance,
  returnBook,
  updateIssuance,
  deleteIssuance,
};