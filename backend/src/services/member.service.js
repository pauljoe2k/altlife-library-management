const prisma = require("../config/db");

// Helper to format database member objects to the API presentation schema
const formatMember = (member) => {
  if (!member) return null;
  return {
    memberId: member.mem_id,
    name: member.mem_name,
    email: member.mem_email,
    phone: member.mem_phone,
  };
};

const getAllMembers = async () => {
  const members = await prisma.member.findMany();
  return members.map(formatMember);
};

const getMemberById = async (id) => {
  const member = await prisma.member.findUnique({
    where: {
      mem_id: Number(id),
    },
  });
  return formatMember(member);
};

const createMember = async (data) => {
  return await prisma.$transaction(async (tx) => {
    const member = await tx.member.create({
      data: {
        mem_name: data.name,
        mem_email: data.email,
        mem_phone: data.phone,
      },
    });

    await tx.membership.create({
      data: {
        member_id: member.mem_id,
        status: "Active",
      },
    });

    return formatMember(member);
  });
};

const updateMember = async (id, data) => {
  const memberId = Number(id);
  const exists = await prisma.member.findUnique({ where: { mem_id: memberId } });
  if (!exists) {
    const error = new Error("Member not found");
    error.statusCode = 404;
    error.name = "NotFoundError";
    throw error;
  }

  const updateData = {};
  if (data.name !== undefined) updateData.mem_name = data.name;
  if (data.email !== undefined) updateData.mem_email = data.email;
  if (data.phone !== undefined) updateData.mem_phone = data.phone;

  const updated = await prisma.member.update({
    where: {
      mem_id: memberId,
    },
    data: updateData,
  });

  return formatMember(updated);
};

const deleteMember = async (id) => {
  const memberId = Number(id);
  const exists = await prisma.member.findUnique({ where: { mem_id: memberId } });
  if (!exists) {
    const error = new Error("Member not found");
    error.statusCode = 404;
    error.name = "NotFoundError";
    throw error;
  }

  // Find memberships associated with the member
  const memberships = await prisma.membership.findMany({
    where: { member_id: memberId },
  });
  const membershipIds = memberships.map(m => m.membership_id);

  // Check if member has active loans (outstanding borrowing)
  const activeLoans = await prisma.issuance.count({
    where: {
      membership_id: { in: membershipIds },
      issuance_status: "Issued",
    },
  });

  if (activeLoans > 0) {
    const error = new Error("Cannot delete a member who has outstanding unreturned books");
    error.statusCode = 400;
    error.name = "ConstraintError";
    throw error;
  }

  // Transactionally delete past (returned) issuances, memberships, and the member
  await prisma.$transaction(async (tx) => {
    await tx.issuance.deleteMany({
      where: { membership_id: { in: membershipIds } },
    });
    await tx.membership.deleteMany({
      where: { member_id: memberId },
    });
    await tx.member.delete({
      where: { mem_id: memberId },
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