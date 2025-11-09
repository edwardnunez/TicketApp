/**
 * @file API utility functions for authenticated requests
 * @module utils/api
 * @description Provides helper functions to make authenticated HTTP requests with tokens
 */

import axios from 'axios';

const gatewayUrl = process.env.REACT_APP_API_ENDPOINT || "http://localhost:8000";

/**
 * Gets the admin authentication headers (roleToken for admin operations)
 * @returns {Object} Headers object with Authorization roleToken
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
 * Gets the user authentication headers (token for user operations)
 * @returns {Object} Headers object with Authorization token
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
 * Gets the authentication headers (tries roleToken for admin, falls back to token)
 * @deprecated Use getAdminHeaders() or getUserHeaders() instead
 * @returns {Object} Headers object with Authorization token
 */
export const getAuthHeaders = () => {
  // For backwards compatibility, prefer roleToken (admin) but fallback to token (user)
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
 * Makes an authenticated GET request (uses roleToken for admin operations)
 * @param {string} endpoint - API endpoint (without base URL)
 * @param {Object} config - Additional axios config
 * @returns {Promise} Axios response promise
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
 * Makes an authenticated POST request (uses roleToken for admin operations)
 * @param {string} endpoint - API endpoint (without base URL)
 * @param {Object} data - Request body data
 * @param {Object} config - Additional axios config
 * @returns {Promise} Axios response promise
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
 * Makes an authenticated PUT request (uses roleToken for admin operations)
 * @param {string} endpoint - API endpoint (without base URL)
 * @param {Object} data - Request body data
 * @param {Object} config - Additional axios config
 * @returns {Promise} Axios response promise
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
 * Makes an authenticated PATCH request (uses roleToken for admin operations)
 * @param {string} endpoint - API endpoint (without base URL)
 * @param {Object} data - Request body data
 * @param {Object} config - Additional axios config
 * @returns {Promise} Axios response promise
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
 * Makes an authenticated DELETE request (uses roleToken for admin operations)
 * @param {string} endpoint - API endpoint (without base URL)
 * @param {Object} config - Additional axios config
 * @returns {Promise} Axios response promise
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
 * Makes a user-authenticated GET request (uses regular token, not roleToken)
 * @param {string} endpoint - API endpoint (without base URL)
 * @param {Object} config - Additional axios config
 * @returns {Promise} Axios response promise
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
 * Makes a user-authenticated POST request (uses regular token, not roleToken)
 * @param {string} endpoint - API endpoint (without base URL)
 * @param {Object} data - Request body data
 * @param {Object} config - Additional axios config
 * @returns {Promise} Axios response promise
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
 * Makes a user-authenticated PUT request (uses regular token, not roleToken)
 * @param {string} endpoint - API endpoint (without base URL)
 * @param {Object} data - Request body data
 * @param {Object} config - Additional axios config
 * @returns {Promise} Axios response promise
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
  // Admin operations (use roleToken)
  get: authenticatedGet,
  post: authenticatedPost,
  put: authenticatedPut,
  patch: authenticatedPatch,
  delete: authenticatedDelete,

  // User operations (use regular token)
  userGet: userAuthenticatedGet,
  userPost: userAuthenticatedPost,
  userPut: userAuthenticatedPut,

  // Headers
  getAdminHeaders,
  getUserHeaders,
  getAuthHeaders
};

export default api;
