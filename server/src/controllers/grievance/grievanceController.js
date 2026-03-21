const mongoose = require("mongoose");
const Grievance = require("../../models/Grievance");
const Ward = require("../../models/Ward");
const { User } = require("../../models/User");
const asyncHandler = require("../../utils/asyncHandler");

const toObjectId = (id) => new mongoose.Types.ObjectId(id);

const addStatusEntry = (grievance, { status, userId, note }) => {
  grievance.statusHistory.push({
    status,
    timestamp: new Date(),
    updatedBy: userId,
    note,
  });
};

const ensureAccessToGrievance = (grievance, user) => {
  if (user.role === "admin") {
    return true;
  }

  if (user.role === "citizen") {
    return grievance.citizen?._id?.toString() === user._id.toString();
  }

  if (user.role === "officer") {
    return grievance.ward?._id?.toString() === user.ward?.toString();
  }

  if (user.role === "worker") {
    return grievance.assignedWorker?._id?.toString() === user._id.toString();
  }

  return false;
};

const fileGrievance = asyncHandler(async (req, res) => {
  const { title, description, category, ward } = req.body;
  const imageUrls = (req.files || []).map((file) => `/uploads/${file.filename}`);

  if (!title || !description || !category || !ward) {
    res.status(400);
    throw new Error("Title, description, category, and ward are required");
  }

  const selectedWard = await Ward.findById(ward).populate("officer");

  if (!selectedWard) {
    res.status(404);
    throw new Error("Selected ward not found");
  }

  if (!selectedWard.officer) {
    res.status(400);
    throw new Error("No officer is assigned to this ward yet");
  }

  const grievance = await Grievance.create({
    title,
    description,
    category,
    ward: selectedWard._id,
    citizen: req.user._id,
    assignedOfficer: selectedWard.officer._id,
    status: "assigned_to_officer",
    imageUrls,
    statusHistory: [
      {
        status: "submitted",
        timestamp: new Date(),
        updatedBy: req.user._id,
        note: "Grievance submitted by citizen",
      },
      {
        status: "assigned_to_officer",
        timestamp: new Date(),
        updatedBy: selectedWard.officer._id,
        note: "Automatically assigned to ward officer",
      },
    ],
  });

  const populated = await Grievance.findById(grievance._id)
    .populate("ward", "name")
    .populate("citizen", "name email phone")
    .populate("assignedOfficer", "name email")
    .populate("assignedWorker", "name email");

  res.status(201).json({
    success: true,
    message: "Grievance filed successfully",
    data: populated,
  });
});

const getGrievances = asyncHandler(async (req, res) => {
  const { status, category, ward, fromDate, toDate } = req.query;

  const query = {};

  if (req.user.role === "citizen") {
    query.citizen = req.user._id;
  }

  if (req.user.role === "officer") {
    query.ward = req.user.ward;
  }

  if (req.user.role === "worker") {
    query.assignedWorker = req.user._id;
  }

  if (req.user.role === "admin") {
    if (status) query.status = status;
    if (category) query.category = category;
    if (ward) query.ward = ward;

    if (fromDate || toDate) {
      query.createdAt = {};
      if (fromDate) query.createdAt.$gte = new Date(fromDate);
      if (toDate) query.createdAt.$lte = new Date(toDate);
    }
  }

  const grievances = await Grievance.find(query)
    .sort({ createdAt: -1 })
    .populate("ward", "name")
    .populate("citizen", "name email")
    .populate("assignedOfficer", "name email")
    .populate("assignedWorker", "name email");

  res.status(200).json({
    success: true,
    count: grievances.length,
    data: grievances,
  });
});

const getGrievanceById = asyncHandler(async (req, res) => {
  const grievance = await Grievance.findById(req.params.id)
    .populate("ward", "name")
    .populate("citizen", "name email phone")
    .populate("assignedOfficer", "name email")
    .populate("assignedWorker", "name email")
    .populate("statusHistory.updatedBy", "name role")
    .populate("comments.user", "name role");

  if (!grievance) {
    res.status(404);
    throw new Error("Grievance not found");
  }

  if (!ensureAccessToGrievance(grievance, req.user)) {
    res.status(403);
    throw new Error("You are not allowed to access this grievance");
  }

  res.status(200).json({
    success: true,
    data: grievance,
  });
});

const assignWorker = asyncHandler(async (req, res) => {
  const { workerId, note = "Worker assigned by officer" } = req.body;

  if (!workerId) {
    res.status(400);
    throw new Error("workerId is required");
  }

  const grievance = await Grievance.findById(req.params.id).populate("ward", "name");

  if (!grievance) {
    res.status(404);
    throw new Error("Grievance not found");
  }

  if (grievance.ward._id.toString() !== req.user.ward?.toString()) {
    res.status(403);
    throw new Error("You can only manage grievances in your ward");
  }

  const worker = await User.findOne({
    _id: toObjectId(workerId),
    role: "worker",
    ward: req.user.ward,
    isActive: true,
  });

  if (!worker) {
    res.status(400);
    throw new Error("Worker not found in your ward");
  }

  grievance.assignedWorker = worker._id;
  grievance.status = "worker_assigned";
  addStatusEntry(grievance, {
    status: "worker_assigned",
    userId: req.user._id,
    note,
  });

  await grievance.save();

  const updated = await Grievance.findById(grievance._id)
    .populate("ward", "name")
    .populate("citizen", "name email")
    .populate("assignedOfficer", "name email")
    .populate("assignedWorker", "name email")
    .populate("statusHistory.updatedBy", "name role");

  res.status(200).json({
    success: true,
    message: "Worker assigned successfully",
    data: updated,
  });
});

const markInProgress = asyncHandler(async (req, res) => {
  const { note = "Worker started the task" } = req.body;

  const grievance = await Grievance.findById(req.params.id);

  if (!grievance) {
    res.status(404);
    throw new Error("Grievance not found");
  }

  if (grievance.assignedWorker?.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("You can only update grievances assigned to you");
  }

  if (!["worker_assigned", "appealed"].includes(grievance.status)) {
    res.status(400);
    throw new Error("Grievance must be worker_assigned or appealed before in_progress");
  }

  grievance.status = "in_progress";
  addStatusEntry(grievance, {
    status: "in_progress",
    userId: req.user._id,
    note,
  });

  await grievance.save();

  res.status(200).json({
    success: true,
    message: "Grievance marked as in progress",
    data: grievance,
  });
});

const markResolved = asyncHandler(async (req, res) => {
  const { resolutionNote } = req.body;

  if (!resolutionNote || !resolutionNote.trim()) {
    res.status(400);
    throw new Error("resolutionNote is required");
  }

  const grievance = await Grievance.findById(req.params.id);

  if (!grievance) {
    res.status(404);
    throw new Error("Grievance not found");
  }

  if (grievance.assignedWorker?.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("You can only resolve grievances assigned to you");
  }

  if (grievance.status !== "in_progress") {
    res.status(400);
    throw new Error("Only in_progress grievances can be marked resolved");
  }

  grievance.status = "resolved";
  grievance.resolutionNote = resolutionNote.trim();
  addStatusEntry(grievance, {
    status: "resolved",
    userId: req.user._id,
    note: "Worker marked grievance as resolved",
  });

  await grievance.save();

  res.status(200).json({
    success: true,
    message: "Grievance marked as resolved",
    data: grievance,
  });
});

const closeGrievance = asyncHandler(async (req, res) => {
  const { note = "Officer verified and closed grievance" } = req.body;

  const grievance = await Grievance.findById(req.params.id).populate("ward", "name");

  if (!grievance) {
    res.status(404);
    throw new Error("Grievance not found");
  }

  if (grievance.ward._id.toString() !== req.user.ward?.toString()) {
    res.status(403);
    throw new Error("You can only close grievances in your ward");
  }

  if (grievance.status !== "resolved") {
    res.status(400);
    throw new Error("Only resolved grievances can be closed");
  }

  grievance.status = "closed";
  grievance.isOverdue = false;
  addStatusEntry(grievance, {
    status: "closed",
    userId: req.user._id,
    note,
  });

  await grievance.save();

  res.status(200).json({
    success: true,
    message: "Grievance closed successfully",
    data: grievance,
  });
});

const appealGrievance = asyncHandler(async (req, res) => {
  const { note = "Citizen requested re-open" } = req.body;

  const grievance = await Grievance.findById(req.params.id);

  if (!grievance) {
    res.status(404);
    throw new Error("Grievance not found");
  }

  if (grievance.citizen.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("You can only appeal your own grievances");
  }

  if (grievance.status !== "closed") {
    res.status(400);
    throw new Error("Only closed grievances can be appealed");
  }

  grievance.status = "appealed";
  grievance.assignedWorker = null;
  grievance.rating = null;
  grievance.ratingComment = "";
  addStatusEntry(grievance, {
    status: "appealed",
    userId: req.user._id,
    note,
  });

  await grievance.save();

  res.status(200).json({
    success: true,
    message: "Grievance appealed successfully",
    data: grievance,
  });
});

module.exports = {
  fileGrievance,
  getGrievances,
  getGrievanceById,
  assignWorker,
  markInProgress,
  markResolved,
  closeGrievance,
  appealGrievance,
};
