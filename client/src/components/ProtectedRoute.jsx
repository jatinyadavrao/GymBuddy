import { Navigate } from "react-router-dom";
import { authStore } from "../context/authStore";

const ProtectedRoute = ({ children }) => {
  const token = authStore((state) => state.token);
  return token ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
