import axiosInstance from "./axiosInstance";

export const getAllWardsRequest = async () => {
  const response = await axiosInstance.get("/wards");
  return response.data;
};
