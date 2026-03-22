const Ward = require("../../models/Ward");
const asyncHandler = require("../../utils/asyncHandler");

const getAllWards = asyncHandler(async (req, res) => {
  const wards = await Ward.find({})
    .sort({ name: 1 })
    .populate("officer", "name email isActive")
    .select("name description officer");

  res.status(200).json({
    success: true,
    count: wards.length,
    data: wards,
  });
});

const createWard = asyncHandler(async (req, res) => {
  const { name, description = "" } = req.body;

  if (!name || !name.trim()) {
    res.status(400);
    throw new Error("Ward name is required");
  }

  const ward = await Ward.create({
    name: name.trim(),
    description: description.trim(),
  });

  res.status(201).json({
    success: true,
    message: "Ward created successfully",
    data: ward,
  });
});

const updateWard = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const ward = await Ward.findById(req.params.id);

  if (!ward) {
    res.status(404);
    throw new Error("Ward not found");
  }

  if (name !== undefined) {
    ward.name = name.trim();
  }

  if (description !== undefined) {
    ward.description = description.trim();
  }

  await ward.save();

  res.status(200).json({
    success: true,
    message: "Ward updated successfully",
    data: ward,
  });
});

const deleteWard = asyncHandler(async (req, res) => {
  const ward = await Ward.findById(req.params.id);

  if (!ward) {
    res.status(404);
    throw new Error("Ward not found");
  }

  await ward.deleteOne();

  res.status(200).json({
    success: true,
    message: "Ward deleted successfully",
  });
});

module.exports = {
  getAllWards,
  createWard,
  updateWard,
  deleteWard,
};
