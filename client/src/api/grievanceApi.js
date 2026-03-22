import axiosInstance from "./axiosInstance";

export const createGrievanceRequest = async (formData) => {
  const response = await axiosInstance.post("/grievances", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const getMyGrievancesRequest = async (queryString = "") => {
  const response = await axiosInstance.get(`/grievances${queryString}`);
  return response.data;
};

export const getGrievanceByIdRequest = async (id) => {
  const response = await axiosInstance.get(`/grievances/${id}`);
  return response.data;
};

export const addGrievanceCommentRequest = async (id, payload) => {
  const response = await axiosInstance.post(`/grievances/${id}/comments`, payload);
  return response.data;
};

export const addGrievanceRatingRequest = async (id, payload) => {
  const response = await axiosInstance.post(`/grievances/${id}/rating`, payload);
  return response.data;
};

export const getPublicGrievanceByIdRequest = async (grievanceId) => {
  const response = await axiosInstance.get(`/grievances/public/track/${grievanceId}`);
  return response.data;
};

export const assignWorkerRequest = async (id, payload) => {
  const response = await axiosInstance.patch(`/grievances/${id}/assign-worker`, payload);
  return response.data;
};

export const markInProgressRequest = async (id, payload) => {
  const response = await axiosInstance.patch(`/grievances/${id}/start-work`, payload);
  return response.data;
};

export const markResolvedRequest = async (id, payload) => {
  const response = await axiosInstance.patch(`/grievances/${id}/resolve`, payload);
  return response.data;
};

export const closeGrievanceRequest = async (id, payload) => {
  const response = await axiosInstance.patch(`/grievances/${id}/close`, payload);
  return response.data;
};

export const getOfficerStatsRequest = async () => {
  const response = await axiosInstance.get("/grievances/officer/stats");
  return response.data;
};
