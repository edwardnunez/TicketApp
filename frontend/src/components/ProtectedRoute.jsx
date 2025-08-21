import { Navigate } from "react-router-dom";
import { ensureAuthFreshness } from "../utils/authSession";

const ProtectedRoute = ({ element }) => {
  const expired = ensureAuthFreshness();
  const token = !expired ? localStorage.getItem("token") : null;

  if (!token) {
    return <Navigate to="/login" />;
  }

  return element;
};

export default ProtectedRoute;
