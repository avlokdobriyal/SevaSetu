const jwt = require("jsonwebtoken");
const { User } = require("../../models/User");
const Ward = require("../../models/Ward");
const asyncHandler = require("../../utils/asyncHandler");

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

const registerCitizen = asyncHandler(async (req, res) => {
  const { name, email, password, phone, address, ward } = req.body;

  if (!name || !email || !password || !phone || !address || !ward) {
    res.status(400);
    throw new Error("Please provide name, email, password, phone, address, and ward");
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    res.status(409);
    throw new Error("Email is already registered");
  }

  const wardExists = await Ward.findById(ward);
  if (!wardExists) {
    res.status(400);
    throw new Error("Selected ward does not exist");
  }

  const user = await User.create({
    name,
    email,
    password,
    phone,
    role: "citizen",
    ward,
  });

  const token = generateToken(user._id);

  res.status(201).json({
    success: true,
    message: "Citizen registration successful",
    data: {
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role,
        ward: user.ward,
        isActive: user.isActive,
      },
    },
  });
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("Please provide email and password");
  }

  const user = await User.findOne({ email: email.toLowerCase() })
    .select("+password")
    .populate("ward", "name");

  if (!user) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  if (!user.isActive) {
    res.status(403);
    throw new Error("Account is deactivated. Please contact admin.");
  }

  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  const token = generateToken(user._id);

  res.status(200).json({
    success: true,
    message: "Login successful",
    data: {
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role,
        ward: user.ward,
        isActive: user.isActive,
      },
    },
  });
});

const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    data: req.user,
  });
});

module.exports = {
  registerCitizen,
  loginUser,
  getMe,
};
