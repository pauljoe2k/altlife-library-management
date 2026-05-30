const prisma = require("../config/db");

const getAllMembers = async () => {
  return await prisma.member.findMany();
};

const getMemberById = async (id) => {
  return await prisma.member.findUnique({
    where: {
      id: Number(id),
    },
  });
};

const createMember = async (data) => {
  return await prisma.member.create({
    data,
  });
};

const updateMember = async (id, data) => {
  const memberId = Number(id);
  const exists = await prisma.member.findUnique({ where: { id: memberId } });
  if (!exists) {
    const error = new Error("Member not found");
    error.statusCode = 404;
    error.name = "NotFoundError";
    throw error;
  }

  return await prisma.member.update({
    where: {
      id: memberId,
    },
    data,
  });
};

const deleteMember = async (id) => {
  const memberId = Number(id);
  const exists = await prisma.member.findUnique({ where: { id: memberId } });
  if (!exists) {
    const error = new Error("Member not found");
    error.statusCode = 404;
    error.name = "NotFoundError";
    throw error;
  }

  // Check if member has active loans (outstanding borrowing)
  const activeLoans = await prisma.issuance.count({
    where: {
      memberId,
      returnedAt: null,
    },
  });

  if (activeLoans > 0) {
    const error = new Error("Cannot delete a member who has outstanding unreturned books");
    error.statusCode = 400;
    error.name = "ConstraintError";
    throw error;
  }

  // Transactionally delete past (returned) issuances and the member
  return await prisma.$transaction(async (tx) => {
    await tx.issuance.deleteMany({
      where: { memberId },
    });
    return await tx.member.delete({
      where: { id: memberId },
    });
  });
};

module.exports = {
  getAllMembers,
  getMemberById,
  createMember,
  updateMember,
  deleteMember,
};