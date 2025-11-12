/**
 * @file Funciones utilitarias de API para solicitudes autenticadas
 * @module utils/api
 * @description Proporciona funciones auxiliares para realizar solicitudes HTTP autenticadas con tokens
 */

import axios from 'axios';

const gatewayUrl = process.env.REACT_APP_API_ENDPOINT || "http://localhost:8000";

/**
 * Obtiene los encabezados de autenticación de administrador (roleToken para operaciones de administrador)
 * @returns {Object} Objeto de encabezados con roleToken de autorización
 */
export const getAdminHeaders = () => {
  const roleToken = localStorage.getItem('roleToken');

  if (!roleToken) {
    return {};
  }

  return {
    Authorization: `Bearer ${roleToken}`
  };
};

/**
 * Obtiene los encabezados de autenticación de usuario (token para operaciones de usuario)
 * @returns {Object} Objeto de encabezados con token de autorización
 */
export const getUserHeaders = () => {
  const token = localStorage.getItem('token');

  if (!token) {
    return {};
  }

  return {
    Authorization: `Bearer ${token}`
  };
};

/**
 * Obtiene los encabezados de autenticación (intenta roleToken para admin, regresa a token)
 * @deprecated Use getAdminHeaders() o getUserHeaders() en su lugar
 * @returns {Object} Objeto de encabezados con token de autorización
 */
export const getAuthHeaders = () => {
  // Para compatibilidad hacia atrás, prefiere roleToken (admin) pero regresa a token (usuario)
  const roleToken = localStorage.getItem('roleToken');
  const token = localStorage.getItem('token');

  const authToken = roleToken || token;

  if (!authToken) {
    return {};
  }

  return {
    Authorization: `Bearer ${authToken}`
  };
};

/**
 * Realiza una solicitud GET autenticada (usa roleToken para operaciones de administrador)
 * @param {string} endpoint - Endpoint de API (sin URL base)
 * @param {Object} config - Configuración adicional de axios
 * @returns {Promise} Promesa de respuesta de Axios
 */
export const authenticatedGet = (endpoint, config = {}) => {
  return axios.get(`${gatewayUrl}${endpoint}`, {
    ...config,
    headers: {
      ...getAdminHeaders(),
      ...config.headers
    }
  });
};

/**
 * Realiza una solicitud POST autenticada (usa roleToken para operaciones de administrador)
 * @param {string} endpoint - Endpoint de API (sin URL base)
 * @param {Object} data - Datos del cuerpo de la solicitud
 * @param {Object} config - Configuración adicional de axios
 * @returns {Promise} Promesa de respuesta de Axios
 */
export const authenticatedPost = (endpoint, data, config = {}) => {
  return axios.post(`${gatewayUrl}${endpoint}`, data, {
    ...config,
    headers: {
      ...getAdminHeaders(),
      ...config.headers
    }
  });
};

/**
 * Realiza una solicitud PUT autenticada (usa roleToken para operaciones de administrador)
 * @param {string} endpoint - Endpoint de API (sin URL base)
 * @param {Object} data - Datos del cuerpo de la solicitud
 * @param {Object} config - Configuración adicional de axios
 * @returns {Promise} Promesa de respuesta de Axios
 */
export const authenticatedPut = (endpoint, data, config = {}) => {
  return axios.put(`${gatewayUrl}${endpoint}`, data, {
    ...config,
    headers: {
      ...getAdminHeaders(),
      ...config.headers
    }
  });
};

/**
 * Realiza una solicitud PATCH autenticada (usa roleToken para operaciones de administrador)
 * @param {string} endpoint - Endpoint de API (sin URL base)
 * @param {Object} data - Datos del cuerpo de la solicitud
 * @param {Object} config - Configuración adicional de axios
 * @returns {Promise} Promesa de respuesta de Axios
 */
export const authenticatedPatch = (endpoint, data, config = {}) => {
  return axios.patch(`${gatewayUrl}${endpoint}`, data, {
    ...config,
    headers: {
      ...getAdminHeaders(),
      ...config.headers
    }
  });
};

/**
 * Realiza una solicitud DELETE autenticada (usa roleToken para operaciones de administrador)
 * @param {string} endpoint - Endpoint de API (sin URL base)
 * @param {Object} config - Configuración adicional de axios
 * @returns {Promise} Promesa de respuesta de Axios
 */
export const authenticatedDelete = (endpoint, config = {}) => {
  return axios.delete(`${gatewayUrl}${endpoint}`, {
    ...config,
    headers: {
      ...getAdminHeaders(),
      ...config.headers
    }
  });
};

/**
 * Realiza una solicitud GET autenticada de usuario (usa token regular, no roleToken)
 * @param {string} endpoint - Endpoint de API (sin URL base)
 * @param {Object} config - Configuración adicional de axios
 * @returns {Promise} Promesa de respuesta de Axios
 */
export const userAuthenticatedGet = (endpoint, config = {}) => {
  return axios.get(`${gatewayUrl}${endpoint}`, {
    ...config,
    headers: {
      ...getUserHeaders(),
      ...config.headers
    }
  });
};

/**
 * Realiza una solicitud POST autenticada de usuario (usa token regular, no roleToken)
 * @param {string} endpoint - Endpoint de API (sin URL base)
 * @param {Object} data - Datos del cuerpo de la solicitud
 * @param {Object} config - Configuración adicional de axios
 * @returns {Promise} Promesa de respuesta de Axios
 */
export const userAuthenticatedPost = (endpoint, data, config = {}) => {
  return axios.post(`${gatewayUrl}${endpoint}`, data, {
    ...config,
    headers: {
      ...getUserHeaders(),
      ...config.headers
    }
  });
};

/**
 * Realiza una solicitud PUT autenticada de usuario (usa token regular, no roleToken)
 * @param {string} endpoint - Endpoint de API (sin URL base)
 * @param {Object} data - Datos del cuerpo de la solicitud
 * @param {Object} config - Configuración adicional de axios
 * @returns {Promise} Promesa de respuesta de Axios
 */
export const userAuthenticatedPut = (endpoint, data, config = {}) => {
  return axios.put(`${gatewayUrl}${endpoint}`, data, {
    ...config,
    headers: {
      ...getUserHeaders(),
      ...config.headers
    }
  });
};

const api = {
  // Operaciones de administrador (usan roleToken)
  get: authenticatedGet,
  post: authenticatedPost,
  put: authenticatedPut,
  patch: authenticatedPatch,
  delete: authenticatedDelete,

  // Operaciones de usuario (usan token regular)
  userGet: userAuthenticatedGet,
  userPost: userAuthenticatedPost,
  userPut: userAuthenticatedPut,

  // Encabezados
  getAdminHeaders,
  getUserHeaders,
  getAuthHeaders
};

export default api;
