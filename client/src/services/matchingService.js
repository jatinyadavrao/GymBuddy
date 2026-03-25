import api from "./api";

export const swipeLike = async (targetUserId) => {
  const { data } = await api.post("/swipe/like", { targetUserId });
  return data;
};

export const swipeDislike = async (targetUserId) => {
  const { data } = await api.post("/swipe/dislike", { targetUserId });
  return data;
};

export const fetchMatches = async () => {
  const { data } = await api.get("/matches");
  return data;
};

export const acceptMatch = async (matchId) => {
  const { data } = await api.post(`/matches/${matchId}/accept`);
  return data;
};

export const rejectMatch = async (matchId) => {
  const { data } = await api.post(`/matches/${matchId}/reject`);
  return data;
};
