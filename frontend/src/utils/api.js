/**
 * @file API utility functions for authenticated requests
 * @module utils/api
 * @description Provides helper functions to make authenticated HTTP requests with role tokens
 */

import axios from 'axios';

const gatewayUrl = process.env.REACT_APP_API_ENDPOINT || "http://localhost:8000";

/**
 * Gets the authentication headers including the roleToken
 * @returns {Object} Headers object with Authorization token
 */
export const getAuthHeaders = () => {
  const roleToken = localStorage.getItem('roleToken');

  if (!roleToken) {
    return {};
  }

  return {
    Authorization: `Bearer ${roleToken}`
  };
};

/**
 * Makes an authenticated GET request
 * @param {string} endpoint - API endpoint (without base URL)
 * @param {Object} config - Additional axios config
 * @returns {Promise} Axios response promise
 */
export const authenticatedGet = (endpoint, config = {}) => {
  return axios.get(`${gatewayUrl}${endpoint}`, {
    ...config,
    headers: {
      ...getAuthHeaders(),
      ...config.headers
    }
  });
};

/**
 * Makes an authenticated POST request
 * @param {string} endpoint - API endpoint (without base URL)
 * @param {Object} data - Request body data
 * @param {Object} config - Additional axios config
 * @returns {Promise} Axios response promise
 */
export const authenticatedPost = (endpoint, data, config = {}) => {
  return axios.post(`${gatewayUrl}${endpoint}`, data, {
    ...config,
    headers: {
      ...getAuthHeaders(),
      ...config.headers
    }
  });
};

/**
 * Makes an authenticated PUT request
 * @param {string} endpoint - API endpoint (without base URL)
 * @param {Object} data - Request body data
 * @param {Object} config - Additional axios config
 * @returns {Promise} Axios response promise
 */
export const authenticatedPut = (endpoint, data, config = {}) => {
  return axios.put(`${gatewayUrl}${endpoint}`, data, {
    ...config,
    headers: {
      ...getAuthHeaders(),
      ...config.headers
    }
  });
};

/**
 * Makes an authenticated PATCH request
 * @param {string} endpoint - API endpoint (without base URL)
 * @param {Object} data - Request body data
 * @param {Object} config - Additional axios config
 * @returns {Promise} Axios response promise
 */
export const authenticatedPatch = (endpoint, data, config = {}) => {
  return axios.patch(`${gatewayUrl}${endpoint}`, data, {
    ...config,
    headers: {
      ...getAuthHeaders(),
      ...config.headers
    }
  });
};

/**
 * Makes an authenticated DELETE request
 * @param {string} endpoint - API endpoint (without base URL)
 * @param {Object} config - Additional axios config
 * @returns {Promise} Axios response promise
 */
export const authenticatedDelete = (endpoint, config = {}) => {
  return axios.delete(`${gatewayUrl}${endpoint}`, {
    ...config,
    headers: {
      ...getAuthHeaders(),
      ...config.headers
    }
  });
};

export default {
  get: authenticatedGet,
  post: authenticatedPost,
  put: authenticatedPut,
  patch: authenticatedPatch,
  delete: authenticatedDelete,
  getAuthHeaders
};
