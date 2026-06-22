const memberService = require("../services/member.service");
const asyncHandler = require("../utils/asyncHandler");

const getMembers = asyncHandler(async (req, res) => {
  const members = await memberService.getAllMembers();
  res.json({
    status: "success",
    results: members.length,
    data: members,
  });
});

const getMember = asyncHandler(async (req, res) => {
  const member = await memberService.getMemberById(req.params.id);

  if (!member) {
    return res.status(404).json({
      status: "fail",
      error: "NotFoundError",
      message: "Member not found",
    });
  }

  res.json({
    status: "success",
    data: member,
  });
});

const createMember = asyncHandler(async (req, res) => {
  const member = await memberService.createMember(req.body);

  res.status(201).json({
    status: "success",
    message: "Member created successfully",
    data: member,
  });
});

const updateMember = asyncHandler(async (req, res) => {
  const member = await memberService.updateMember(req.params.id, req.body);

  res.json({
    status: "success",
    message: "Member updated successfully",
    data: member,
  });
});

const deleteMember = asyncHandler(async (req, res) => {
  await memberService.deleteMember(req.params.id);

  res.json({
    status: "success",
    message: "Member deleted successfully",
  });
});

module.exports = {
  getMembers,
  getMember,
  createMember,
  updateMember,
  deleteMember,
};