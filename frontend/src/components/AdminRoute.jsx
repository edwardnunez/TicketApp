import { Navigate } from "react-router-dom";

const AdminRoute = ({ element }) => {
  const roleToken = localStorage.getItem("roleToken");

  const decoded = jwt.verify(token, 'your-secret-key');
  const role = decoded.role;

  if (role==="user") {
    return <Navigate to="/home" />;
  }

  return element;
};

export default AdminRoute;
