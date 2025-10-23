import { useState, useEffect } from 'react';
import { ensureAuthFreshness } from '../utils/authSession';
import axios from 'axios';

/**
 * Hook personalizado para gestionar el rol del usuario y estado de autenticación
 * @returns {Object} Información del rol del usuario y estado de autenticación
 * @returns {string|null} userRole - Rol actual del usuario (admin, user, null)
 * @returns {boolean} isAdmin - Si el usuario tiene privilegios de administrador
 * @returns {boolean} isLoading - Estado de carga para verificación del rol
 * @returns {boolean} isAuthenticated - Si el usuario está autenticado
 */
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

    // Ejecutar al montar
    checkUserRole();

    // Escuchar cambios en la autenticación
    window.addEventListener('authChange', checkUserRole);

    return () => {
      window.removeEventListener('authChange', checkUserRole);
    };
  }, [gatewayUrl]);

  return {
    userRole,
    isAdmin,
    isLoading,
    isAuthenticated: userRole !== null
  };
};

export default useUserRole;
