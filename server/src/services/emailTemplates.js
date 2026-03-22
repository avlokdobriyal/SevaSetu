const baseTemplate = ({ title, intro, details = [], ctaText = "", ctaUrl = "" }) => {
  const detailsHtml = details
    .map((item) => `<li style=\"margin-bottom:6px;\"><strong>${item.label}:</strong> ${item.value}</li>`)
    .join("");

  const ctaHtml = ctaUrl
    ? `<a href=\"${ctaUrl}\" style=\"display:inline-block;margin-top:16px;padding:10px 14px;background:#2563EB;color:#fff;text-decoration:none;border-radius:6px;\">${ctaText || "View Details"}</a>`
    : "";

  return `
    <div style="font-family:Arial,sans-serif;line-height:1.5;color:#1f2937;max-width:640px;margin:0 auto;">
      <h2 style="margin-bottom:10px;color:#2563EB;">${title}</h2>
      <p style="margin-bottom:12px;">${intro}</p>
      <ul style="padding-left:20px;margin:0 0 10px 0;">${detailsHtml}</ul>
      ${ctaHtml}
      <p style="margin-top:20px;color:#6b7280;font-size:13px;">SevaSetu - Citizen Grievance Portal</p>
    </div>
  `;
};

const buildGrievanceUrl = (grievanceId) => {
  const base = process.env.CLIENT_URL || "http://localhost:5173";
  return `${base}/track`;
};

const grievanceCreatedCitizenTemplate = ({ grievance }) =>
  baseTemplate({
    title: "Grievance Submitted Successfully",
    intro: "Your grievance has been recorded and assigned to the ward officer.",
    details: [
      { label: "Grievance ID", value: grievance.grievanceId },
      { label: "Title", value: grievance.title },
      { label: "Status", value: "Assigned to Officer" },
    ],
    ctaText: "Track Grievance",
    ctaUrl: buildGrievanceUrl(grievance.grievanceId),
  });

const grievanceCreatedOfficerTemplate = ({ grievance, wardName }) =>
  baseTemplate({
    title: "New Grievance in Your Ward",
    intro: `A new grievance has been filed in ${wardName}.`,
    details: [
      { label: "Grievance ID", value: grievance.grievanceId },
      { label: "Title", value: grievance.title },
      { label: "Category", value: grievance.category },
    ],
  });

const workerAssignedTemplate = ({ grievance, workerName }) =>
  baseTemplate({
    title: "New Grievance Assigned",
    intro: `Hello ${workerName}, you have been assigned a new grievance.`,
    details: [
      { label: "Grievance ID", value: grievance.grievanceId },
      { label: "Title", value: grievance.title },
      { label: "Current Status", value: "Worker Assigned" },
    ],
  });

const grievanceResolvedTemplate = ({ grievance }) =>
  baseTemplate({
    title: "Grievance Marked as Resolved",
    intro: "The worker has marked this grievance as resolved.",
    details: [
      { label: "Grievance ID", value: grievance.grievanceId },
      { label: "Title", value: grievance.title },
      { label: "Resolution Note", value: grievance.resolutionNote || "Provided" },
    ],
  });

const grievanceClosedTemplate = ({ grievance }) =>
  baseTemplate({
    title: "Grievance Closed",
    intro: "Your grievance has been verified and closed by the officer. Please rate your experience.",
    details: [
      { label: "Grievance ID", value: grievance.grievanceId },
      { label: "Title", value: grievance.title },
      { label: "Status", value: "Closed" },
    ],
    ctaText: "Open SevaSetu",
    ctaUrl: process.env.CLIENT_URL || "http://localhost:5173",
  });

const grievanceOverdueTemplate = ({ grievance, wardName }) =>
  baseTemplate({
    title: "Grievance Marked Overdue",
    intro: `A grievance in ${wardName} has crossed SLA and is now overdue.`,
    details: [
      { label: "Grievance ID", value: grievance.grievanceId },
      { label: "Title", value: grievance.title },
      { label: "SLA Deadline", value: new Date(grievance.slaDeadline).toLocaleString() },
    ],
  });

const grievanceAppealedTemplate = ({ grievance }) =>
  baseTemplate({
    title: "Grievance Re-opened by Citizen",
    intro: "A closed grievance has been appealed and sent back for review.",
    details: [
      { label: "Grievance ID", value: grievance.grievanceId },
      { label: "Title", value: grievance.title },
      { label: "Status", value: "Appealed / Re-opened" },
    ],
  });

module.exports = {
  grievanceCreatedCitizenTemplate,
  grievanceCreatedOfficerTemplate,
  workerAssignedTemplate,
  grievanceResolvedTemplate,
  grievanceClosedTemplate,
  grievanceOverdueTemplate,
  grievanceAppealedTemplate,
};
