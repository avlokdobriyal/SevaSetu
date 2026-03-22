const cron = require("node-cron");
const Grievance = require("../models/Grievance");
const { sendEmail } = require("../services/emailService");
const { grievanceOverdueTemplate } = require("../services/emailTemplates");

const runSlaOverdueCheck = async () => {
  const now = new Date();

  const overdueCandidates = await Grievance.find({
    status: { $ne: "closed" },
    isOverdue: false,
    slaDeadline: { $lt: now },
  })
    .populate("assignedOfficer", "name email")
    .populate("ward", "name");

  for (const grievance of overdueCandidates) {
    grievance.isOverdue = true;
    grievance.statusHistory.push({
      status: "overdue",
      timestamp: new Date(),
      updatedBy: grievance.assignedOfficer?._id || null,
      note: "Marked overdue by SLA scheduler",
    });

    await grievance.save();

    try {
      await sendEmail(
        grievance.assignedOfficer?.email,
        `SevaSetu: Grievance ${grievance.grievanceId} is overdue`,
        grievanceOverdueTemplate({
          grievance,
          wardName: grievance?.ward?.name || "your ward",
        })
      );
    } catch (error) {
      console.error(`Overdue email failed (${grievance.grievanceId}): ${error.message}`);
    }
  }

  if (overdueCandidates.length > 0) {
    console.log(`[SLA Job] Marked ${overdueCandidates.length} grievances as overdue`);
  }
};

const startSlaOverdueJob = () => {
  cron.schedule("0 * * * *", async () => {
    try {
      await runSlaOverdueCheck();
    } catch (error) {
      console.error(`[SLA Job] Failed: ${error.message}`);
    }
  });

  console.log("[SLA Job] Hourly overdue check scheduled");
};

module.exports = {
  startSlaOverdueJob,
  runSlaOverdueCheck,
};
