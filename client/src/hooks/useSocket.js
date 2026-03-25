import { useEffect, useMemo } from "react";
import { authStore } from "../context/authStore";
import { disconnectSocket, getSocket } from "../services/socket";

export const useSocket = () => {
  const token = authStore((state) => state.token);

  const socket = useMemo(() => {
    if (!token) return null;
    return getSocket(token);
  }, [token]);

  useEffect(() => {
    return () => {
      if (!token) {
        disconnectSocket();
      }
    };
  }, [token]);

  return socket;
};
