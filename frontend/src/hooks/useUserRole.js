import { useState, useEffect } from 'react';
import { ensureAuthFreshness } from '../utils/authSession';
import axios from 'axios';

const useUserRole = () => {
  const [userRole, setUserRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const gatewayUrl = process.env.REACT_APP_API_ENDPOINT || "http://localhost:8000";

  useEffect(() => {
    const checkUserRole = async () => {
      try {
        setIsLoading(true);
        const expired = ensureAuthFreshness();
        const roleToken = !expired ? localStorage.getItem("roleToken") : null;

        if (!roleToken) {
          setUserRole(null);
          setIsAdmin(false);
          setIsLoading(false);
          return;
        }

        // Verificar el token con el backend
        const response = await axios.post(gatewayUrl + '/verifyToken', { token: roleToken });
        const role = response.data.role;
        
        setUserRole(role);
        setIsAdmin(role === 'admin');
      } catch (error) {
        console.error("Error verifying user role:", error);
        setUserRole(null);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkUserRole();
  }, [gatewayUrl]);

  return {
    userRole,
    isAdmin,
    isLoading,
    isAuthenticated: userRole !== null
  };
};

export default useUserRole;
