export const getRoleDashboardPath = (role) => {
  switch (role) {
    case "citizen":
      return "/citizen/dashboard";
    case "officer":
      return "/officer/dashboard";
    case "worker":
      return "/worker/dashboard";
    case "admin":
      return "/admin/dashboard";
    default:
      return "/";
  }
};
