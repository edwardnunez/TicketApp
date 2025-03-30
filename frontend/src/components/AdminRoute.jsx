import { Navigate } from "react-router-dom";
import jwt from 'jsonwebtoken';

const AdminRoute = ({ element }) => {
  const roleToken = localStorage.getItem("roleToken");

  const decoded = jwt.verify(roleToken, 'your-secret-key');
  const role = decoded.role;

  if (role==="user") {
    return <Navigate to="/home" />;
  }

  return element;
};

export default AdminRoute;
