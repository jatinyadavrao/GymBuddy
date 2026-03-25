import api from "./api";

export const analyzeBio = async (bio) => {
  const { data } = await api.post("/ai/analyze-bio", { bio });
  return data;
};

export const getCompatibility = async (userAId, userBId) => {
  const { data } = await api.post("/ai/compatibility", { userAId, userBId });
  return data;
};

export const getMatchScore = async (userAId, userBId) => {
  const { data } = await api.post("/ai/match-score", { userAId, userBId });
  return data;
};

export const getIcebreakers = async (matchId) => {
  const { data } = await api.post("/ai/icebreakers", { matchId });
  return data;
};

export const getWorkoutSuggestions = async () => {
  const { data } = await api.get("/ai/workout-suggestions");
  return data;
};
