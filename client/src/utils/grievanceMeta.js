export const CATEGORY_OPTIONS = [
  { value: "roads_infrastructure", label: "Roads / Infrastructure" },
  { value: "water_supply", label: "Water Supply" },
  { value: "streetlights", label: "Streetlights" },
  { value: "drainage_sewage", label: "Drainage / Sewage" },
  { value: "garbage_disposal", label: "Garbage Disposal" },
  { value: "other", label: "Other" },
];

export const STATUS_LABELS = {
  submitted: "Submitted",
  assigned_to_officer: "Assigned to Officer",
  worker_assigned: "Worker Assigned",
  in_progress: "In Progress",
  resolved: "Resolved",
  closed: "Closed",
  overdue: "Overdue",
  appealed: "Appealed / Re-opened",
};

export const getStatusLabel = (status) => STATUS_LABELS[status] || status;
