import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { ensureAuthFreshness } from "../utils/authSession";
import axios from "axios";

const AdminRoute = ({ element }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [loading, setLoading] = useState(true);
  const expired = ensureAuthFreshness();
  const roleToken = !expired ? localStorage.getItem("roleToken") : null;
  
  const gatewayUrl = process.env.REACT_APP_API_ENDPOINT || "http://localhost:8000";

  useEffect(() => {
    if (!roleToken) {
      setIsAuthenticated(false);
      setLoading(false);
      return;
    }

    axios.post(gatewayUrl + '/verifyToken', { token: roleToken })
      .then(response => {
        const role = response.data.role;
        if (role === "admin") {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
        setLoading(false);
      })
      .catch(error => {
        console.error("Token verification failed", error);
        setIsAuthenticated(false);
        setLoading(false);
      });
  }, [roleToken, gatewayUrl]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return element;
};

export default AdminRoute;
