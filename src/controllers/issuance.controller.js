const issuanceService = require("../services/issuance.service");
const asyncHandler = require("../utils/asyncHandler");

const getIssuances = asyncHandler(async (req, res) => {
  const issuances = await issuanceService.getAllIssuances();
  res.json({
    status: "success",
    results: issuances.length,
    data: issuances,
  });
});

const getIssuance = asyncHandler(async (req, res) => {
  const issuance = await issuanceService.getIssuanceById(req.params.id);

  if (!issuance) {
    return res.status(404).json({
      status: "fail",
      error: "NotFoundError",
      message: "Issuance record not found",
    });
  }

  res.json({
    status: "success",
    data: issuance,
  });
});

const createIssuance = asyncHandler(async (req, res) => {
  const issuance = await issuanceService.createIssuance(req.body);

  res.status(201).json({
    status: "success",
    message: "Book issued successfully",
    data: issuance,
  });
});

const returnBook = asyncHandler(async (req, res) => {
  const issuance = await issuanceService.returnBook(req.params.id);

  res.json({
    status: "success",
    message: "Book returned successfully",
    data: issuance,
  });
});

module.exports = {
  getIssuances,
  getIssuance,
  createIssuance,
  returnBook,
};