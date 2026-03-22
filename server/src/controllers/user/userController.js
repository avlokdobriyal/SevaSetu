const Ward = require("../../models/Ward");
const { User } = require("../../models/User");
const asyncHandler = require("../../utils/asyncHandler");

const sanitizeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  address: user.address,
  role: user.role,
  ward: user.ward,
  isActive: user.isActive,
  createdAt: user.createdAt,
});

const createOfficerByAdmin = asyncHandler(async (req, res) => {
  const { name, email, password, phone = "", address = "", wardId } = req.body;

  if (!name || !email || !password || !wardId) {
    res.status(400);
    throw new Error("name, email, password, and wardId are required");
  }

  const ward = await Ward.findById(wardId);
  if (!ward) {
    res.status(404);
    throw new Error("Ward not found");
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    res.status(409);
    throw new Error("Email already in use");
  }

  const officer = await User.create({
    name,
    email,
    password,
    phone,
    address,
    role: "officer",
    ward: ward._id,
    isActive: true,
  });

  ward.officer = officer._id;
  await ward.save();

  const populatedOfficer = await User.findById(officer._id).populate("ward", "name");

  res.status(201).json({
    success: true,
    message: "Officer created successfully",
    data: sanitizeUser(populatedOfficer),
  });
});

const createWorkerByOfficer = asyncHandler(async (req, res) => {
  const { name, email, password, phone = "", address = "" } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("name, email, and password are required");
  }

  if (!req.user.ward) {
    res.status(400);
    throw new Error("Officer is not assigned to any ward");
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    res.status(409);
    throw new Error("Email already in use");
  }

  const worker = await User.create({
    name,
    email,
    password,
    phone,
    address,
    role: "worker",
    ward: req.user.ward,
    isActive: true,
  });

  const populatedWorker = await User.findById(worker._id).populate("ward", "name");

  res.status(201).json({
    success: true,
    message: "Worker created successfully",
    data: sanitizeUser(populatedWorker),
  });
});

const getWorkers = asyncHandler(async (req, res) => {
  const query = { role: "worker" };

  if (req.user.role === "officer") {
    query.ward = req.user.ward;
  }

  if (req.user.role === "admin" && req.query.ward) {
    query.ward = req.query.ward;
  }

  const workers = await User.find(query)
    .sort({ createdAt: -1 })
    .populate("ward", "name")
    .select("name email phone address role ward isActive createdAt");

  res.status(200).json({
    success: true,
    count: workers.length,
    data: workers,
  });
});

const getOfficers = asyncHandler(async (req, res) => {
  const officers = await User.find({ role: "officer" })
    .sort({ createdAt: -1 })
    .populate("ward", "name")
    .select("name email phone address role ward isActive createdAt");

  res.status(200).json({
    success: true,
    count: officers.length,
    data: officers,
  });
});

const toggleUserActive = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).populate("ward", "name");

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  if (user.role === "admin") {
    res.status(400);
    throw new Error("Admin account cannot be toggled");
  }

  user.isActive = !user.isActive;
  await user.save();

  res.status(200).json({
    success: true,
    message: `User ${user.isActive ? "activated" : "deactivated"} successfully`,
    data: sanitizeUser(user),
  });
});

module.exports = {
  createOfficerByAdmin,
  createWorkerByOfficer,
  getWorkers,
  getOfficers,
  toggleUserActive,
};
