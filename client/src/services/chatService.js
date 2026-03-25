import api from "./api";

export const fetchChat = async (matchId, params = {}) => {
  const { data } = await api.get(`/chat/${matchId}`, { params });
  return data;
};

export const sendChatMessage = async (payload) => {
  const { data } = await api.post("/chat/message", payload);
  return data;
};
