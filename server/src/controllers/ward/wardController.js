const Ward = require("../../models/Ward");
const asyncHandler = require("../../utils/asyncHandler");

const getAllWards = asyncHandler(async (req, res) => {
  const wards = await Ward.find({}).sort({ name: 1 }).select("name description");

  res.status(200).json({
    success: true,
    count: wards.length,
    data: wards,
  });
});

module.exports = {
  getAllWards,
};
