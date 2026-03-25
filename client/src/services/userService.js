import api from "./api";

export const fetchMe = async () => {
  const { data } = await api.get("/users/me");
  return data;
};

export const updateProfile = async (formData) => {
  const { data } = await api.put("/users/update", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return data;
};

export const fetchRecommendations = async (params = {}) => {
  const { data } = await api.get("/users/recommendations", { params });
  return data;
};

export const updateWorkoutCalendar = async (payload) => {
  const { data } = await api.put("/users/workout-calendar", payload);
  return data;
};

export const verifyProfile = async () => {
  const { data } = await api.put("/users/verify");
  return data;
};

export const fetchUserProfile = async (id) => {
  const { data } = await api.get(`/users/${id}`);
  return data;
};
