const Grievance = require("../../models/Grievance");
const Ward = require("../../models/Ward");
const asyncHandler = require("../../utils/asyncHandler");

const getAnalytics = asyncHandler(async (req, res) => {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    totalAllTime,
    totalThisMonth,
    totalResolved,
    totalOverdue,
    averageResolutionResult,
    categoryBreakdown,
    trendData,
  ] = await Promise.all([
    Grievance.countDocuments(),
    Grievance.countDocuments({ createdAt: { $gte: monthStart } }),
    Grievance.countDocuments({ status: { $in: ["resolved", "closed"] } }),
    Grievance.countDocuments({ isOverdue: true }),
    Grievance.aggregate([
      { $match: { status: { $in: ["resolved", "closed"] } } },
      {
        $project: {
          resolutionHours: {
            $divide: [{ $subtract: ["$updatedAt", "$createdAt"] }, 1000 * 60 * 60],
          },
        },
      },
      {
        $group: {
          _id: null,
          avgHours: { $avg: "$resolutionHours" },
        },
      },
    ]),
    Grievance.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]),
    Grievance.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
      {
        $project: {
          _id: 0,
          date: {
            $concat: [
              { $toString: "$_id.year" },
              "-",
              {
                $cond: [
                  { $lt: ["$_id.month", 10] },
                  { $concat: ["0", { $toString: "$_id.month" }] },
                  { $toString: "$_id.month" },
                ],
              },
              "-",
              {
                $cond: [
                  { $lt: ["$_id.day", 10] },
                  { $concat: ["0", { $toString: "$_id.day" }] },
                  { $toString: "$_id.day" },
                ],
              },
            ],
          },
          count: 1,
        },
      },
    ]),
  ]);

  const wards = await Ward.find({}).select("_id name").lean();
  const wardPerformance = await Promise.all(
    wards.map(async (ward) => {
      const [total, resolved, overdue, resolutionResult] = await Promise.all([
        Grievance.countDocuments({ ward: ward._id }),
        Grievance.countDocuments({ ward: ward._id, status: { $in: ["resolved", "closed"] } }),
        Grievance.countDocuments({ ward: ward._id, isOverdue: true }),
        Grievance.aggregate([
          { $match: { ward: ward._id, status: { $in: ["resolved", "closed"] } } },
          {
            $project: {
              resolutionHours: {
                $divide: [{ $subtract: ["$updatedAt", "$createdAt"] }, 1000 * 60 * 60],
              },
            },
          },
          {
            $group: {
              _id: null,
              avgHours: { $avg: "$resolutionHours" },
            },
          },
        ]),
      ]);

      return {
        wardId: ward._id,
        wardName: ward.name,
        total,
        resolved,
        overdue,
        averageResolutionHours: Number((resolutionResult[0]?.avgHours || 0).toFixed(2)),
      };
    })
  );

  res.status(200).json({
    success: true,
    data: {
      summary: {
        totalAllTime,
        totalThisMonth,
        totalResolved,
        totalOverdue,
        averageResolutionHours: Number((averageResolutionResult[0]?.avgHours || 0).toFixed(2)),
      },
      wardPerformance,
      categoryBreakdown,
      trendData,
    },
  });
});

module.exports = {
  getAnalytics,
};
