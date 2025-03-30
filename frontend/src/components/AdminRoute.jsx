import { Navigate } from "react-router-dom";
import axios from "axios";

const AdminRoute = ({ element }) => {
  const roleToken = localStorage.getItem("roleToken");
  
  const gatewayUrl = process.env.REACT_APP_API_ENDPOINT || "http://localhost:8000";

  if (!roleToken) {
    return <Navigate to="/login" />;
  }

  axios.post(gatewayUrl+'/verifyToken', { token: roleToken })
    .then(response => {
      const role = response.data.role;

      if (role !== "admin") {
        return <Navigate to="/home" />;
      }
      return element;
    })
    .catch(error => {
      console.error("Token verification failed", error);
      return <Navigate to="/login" />;
    });
};

export default AdminRoute;
