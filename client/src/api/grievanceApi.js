import axiosInstance from "./axiosInstance";

export const createGrievanceRequest = async (formData) => {
  const response = await axiosInstance.post("/grievances", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const getMyGrievancesRequest = async () => {
  const response = await axiosInstance.get("/grievances");
  return response.data;
};

export const getGrievanceByIdRequest = async (id) => {
  const response = await axiosInstance.get(`/grievances/${id}`);
  return response.data;
};
