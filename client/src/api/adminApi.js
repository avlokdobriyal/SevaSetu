import axiosInstance from "./axiosInstance";

export const getAdminAnalyticsRequest = async () => {
  const response = await axiosInstance.get("/admin/analytics");
  return response.data;
};
