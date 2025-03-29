import { Navigate } from "react-router-dom";

const AdminRoute = ({ element }) => {
  const roleToken = localStorage.getItem("roleToken");

  if (roleToken.getItem("role")=="user") {
    return <Navigate to="/home" />;
  }

  return element;
};

export default AdminRoute;
