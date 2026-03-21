const GRIEVANCE_STATUSES = [
  "submitted",
  "assigned_to_officer",
  "worker_assigned",
  "in_progress",
  "resolved",
  "closed",
  "overdue",
  "appealed",
];

const GRIEVANCE_CATEGORIES = [
  "roads_infrastructure",
  "water_supply",
  "streetlights",
  "drainage_sewage",
  "garbage_disposal",
  "other",
];

const CATEGORY_SLA_DAYS = {
  roads_infrastructure: 7,
  water_supply: 3,
  streetlights: 5,
  drainage_sewage: 5,
  garbage_disposal: 3,
  other: 5,
};

module.exports = {
  GRIEVANCE_STATUSES,
  GRIEVANCE_CATEGORIES,
  CATEGORY_SLA_DAYS,
};
