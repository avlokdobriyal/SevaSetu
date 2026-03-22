const dotenv = require("dotenv");
const mongoose = require("mongoose");
const connectDB = require("./src/config/db");
const { User } = require("./src/models/User");
const Ward = require("./src/models/Ward");
const Grievance = require("./src/models/Grievance");

dotenv.config();

const ensureUser = async (payload) => {
  const existing = await User.findOne({ email: payload.email.toLowerCase() });
  if (existing) {
    return existing;
  }

  return User.create(payload);
};

const ensureWard = async (payload) => {
  const existing = await Ward.findOne({ name: payload.name });
  if (existing) {
    return existing;
  }

  return Ward.create(payload);
};

const seedGrievances = async ({ citizens, wards, officers, workers }) => {
  const year = new Date().getFullYear();
  const now = new Date();
  const oneDay = 24 * 60 * 60 * 1000;

  const grievanceDocs = [
    {
      grievanceId: `GRV-${year}-90001`,
      title: "Large pothole near market road",
      description: "A large pothole is causing traffic issues near the main market.",
      category: "roads_infrastructure",
      status: "submitted",
      ward: wards[0]._id,
      citizen: citizens[0]._id,
      assignedOfficer: officers[0]._id,
      statusHistory: [
        {
          status: "submitted",
          timestamp: new Date(now.getTime() - oneDay),
          updatedBy: citizens[0]._id,
          note: "Grievance submitted by citizen",
        },
      ],
    },
    {
      grievanceId: `GRV-${year}-90002`,
      title: "Streetlight not working at lane 4",
      description: "Streetlight has been off for 3 nights in a row.",
      category: "streetlights",
      status: "in_progress",
      ward: wards[1]._id,
      citizen: citizens[1]._id,
      assignedOfficer: officers[1]._id,
      assignedWorker: workers[1]._id,
      statusHistory: [
        {
          status: "submitted",
          timestamp: new Date(now.getTime() - 3 * oneDay),
          updatedBy: citizens[1]._id,
          note: "Grievance submitted",
        },
        {
          status: "assigned_to_officer",
          timestamp: new Date(now.getTime() - 2.5 * oneDay),
          updatedBy: officers[1]._id,
          note: "Auto-assigned to ward officer",
        },
        {
          status: "in_progress",
          timestamp: new Date(now.getTime() - oneDay),
          updatedBy: officers[1]._id,
          note: "Work started",
        },
      ],
    },
    {
      grievanceId: `GRV-${year}-90003`,
      title: "Drain overflow during rainfall",
      description: "Drainage line overflows and water enters homes during rain.",
      category: "drainage_sewage",
      status: "resolved",
      ward: wards[0]._id,
      citizen: citizens[1]._id,
      assignedOfficer: officers[0]._id,
      assignedWorker: workers[0]._id,
      resolutionNote: "Drain cleaned and flow normalized.",
      statusHistory: [
        {
          status: "submitted",
          timestamp: new Date(now.getTime() - 6 * oneDay),
          updatedBy: citizens[1]._id,
          note: "Initial complaint filed",
        },
        {
          status: "assigned_to_officer",
          timestamp: new Date(now.getTime() - 5 * oneDay),
          updatedBy: officers[0]._id,
          note: "Assigned to officer",
        },
        {
          status: "resolved",
          timestamp: new Date(now.getTime() - 2 * oneDay),
          updatedBy: officers[0]._id,
          note: "Issue resolved by team",
        },
      ],
    },
    {
      grievanceId: `GRV-${year}-90004`,
      title: "Garbage not collected for two days",
      description: "Garbage is piling up at apartment gate and causing odor.",
      category: "garbage_disposal",
      status: "closed",
      ward: wards[1]._id,
      citizen: citizens[0]._id,
      assignedOfficer: officers[1]._id,
      assignedWorker: workers[1]._id,
      resolutionNote: "Collection schedule resumed and area sanitized.",
      rating: 4,
      ratingComment: "Resolved well, but was delayed by one day.",
      statusHistory: [
        {
          status: "submitted",
          timestamp: new Date(now.getTime() - 8 * oneDay),
          updatedBy: citizens[0]._id,
          note: "Complaint submitted",
        },
        {
          status: "assigned_to_officer",
          timestamp: new Date(now.getTime() - 7 * oneDay),
          updatedBy: officers[1]._id,
          note: "Assigned to officer",
        },
        {
          status: "resolved",
          timestamp: new Date(now.getTime() - 4 * oneDay),
          updatedBy: officers[1]._id,
          note: "Garbage cleared",
        },
        {
          status: "closed",
          timestamp: new Date(now.getTime() - 3 * oneDay),
          updatedBy: officers[1]._id,
          note: "Officer closed after verification",
        },
      ],
    },
  ];

  for (const grievanceDoc of grievanceDocs) {
    const existing = await Grievance.findOne({ grievanceId: grievanceDoc.grievanceId });
    if (!existing) {
      await Grievance.create(grievanceDoc);
    }
  }
};

const seed = async () => {
  try {
    await connectDB();

    const admin = await ensureUser({
      name: "SevaSetu Admin",
      email: "admin@sevasetu.com",
      password: "Admin@123",
      phone: "9999999999",
      address: "Head Office",
      role: "admin",
    });

    const wardEntries = [
      { name: "Ward 1", description: "Central ward area" },
      { name: "Ward 2", description: "North residential area" },
      { name: "Ward 3", description: "East civic zone" },
      { name: "Ward 4", description: "West colony area" },
      { name: "Ward 5", description: "South mixed-use area" },
    ];

    const wards = [];
    for (const wardData of wardEntries) {
      const ward = await ensureWard(wardData);
      wards.push(ward);
    }

    const officer1 = await ensureUser({
      name: "Ravi Officer",
      email: "officer1@sevasetu.com",
      password: "Officer@123",
      phone: "9000000001",
      address: "Ward 1 Office",
      role: "officer",
      ward: wards[0]._id,
    });

    const officer2 = await ensureUser({
      name: "Meera Officer",
      email: "officer2@sevasetu.com",
      password: "Officer@123",
      phone: "9000000002",
      address: "Ward 2 Office",
      role: "officer",
      ward: wards[1]._id,
    });

    const citizen1 = await ensureUser({
      name: "Anil Citizen",
      email: "citizen1@sevasetu.com",
      password: "Citizen@123",
      phone: "9111111111",
      address: "Street 10, Ward 1",
      role: "citizen",
      ward: wards[0]._id,
    });

    const citizen2 = await ensureUser({
      name: "Priya Citizen",
      email: "citizen2@sevasetu.com",
      password: "Citizen@123",
      phone: "9222222222",
      address: "Lane 4, Ward 2",
      role: "citizen",
      ward: wards[1]._id,
    });

    const worker1 = await ensureUser({
      name: "Rahul Worker",
      email: "worker1@sevasetu.com",
      password: "Worker@123",
      phone: "9333333331",
      address: "Ward 1 Field Office",
      role: "worker",
      ward: wards[0]._id,
    });

    const worker2 = await ensureUser({
      name: "Suman Worker",
      email: "worker2@sevasetu.com",
      password: "Worker@123",
      phone: "9333333332",
      address: "Ward 2 Field Office",
      role: "worker",
      ward: wards[1]._id,
    });

    await Ward.findByIdAndUpdate(wards[0]._id, { officer: officer1._id });
    await Ward.findByIdAndUpdate(wards[1]._id, { officer: officer2._id });

    await seedGrievances({
      citizens: [citizen1, citizen2],
      wards,
      officers: [officer1, officer2],
      workers: [worker1, worker2],
    });

    console.log("Seed completed successfully");
    console.log("Admin: admin@sevasetu.com / Admin@123");
    console.log("Officer 1: officer1@sevasetu.com / Officer@123");
    console.log("Officer 2: officer2@sevasetu.com / Officer@123");
    console.log("Citizen 1: citizen1@sevasetu.com / Citizen@123");
    console.log("Citizen 2: citizen2@sevasetu.com / Citizen@123");
    console.log("Worker 1: worker1@sevasetu.com / Worker@123");
    console.log("Worker 2: worker2@sevasetu.com / Worker@123");
    console.log(`Total wards: ${await Ward.countDocuments()}`);
    console.log(`Total users: ${await User.countDocuments()}`);
    console.log(`Total grievances: ${await Grievance.countDocuments()}`);
    console.log(`Admin user ready: ${admin.email}`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
};

seed();
