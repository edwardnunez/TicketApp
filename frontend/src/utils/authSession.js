export const AUTH_EXPIRY_KEY = 'authExpiry';

let clearTimerId = null;

/**
 * Sets authentication session data in localStorage
 * @param {Object} params - Authentication parameters
 * @param {string} [params.token] - JWT authentication token
 * @param {string} [params.roleToken] - Role-based JWT token
 * @param {string} [params.username] - Username
 * @param {number} [params.expiryMs=3600000] - Session expiry time in milliseconds (default: 1 hour)
 */
export function setAuthSession({ token, roleToken, username, expiryMs = 60 * 60 * 1000 }) {
  if (token) localStorage.setItem('token', token);
  if (roleToken) localStorage.setItem('roleToken', roleToken);
  if (username) localStorage.setItem('username', username);
  const expiryAt = Date.now() + expiryMs;
  localStorage.setItem(AUTH_EXPIRY_KEY, String(expiryAt));
}

/**
 * Checks if the current authentication session has expired
 * @returns {boolean} True if session is expired
 */
export function isAuthExpired() {
  const expiry = Number(localStorage.getItem(AUTH_EXPIRY_KEY));
  if (!expiry) return false;
  return Date.now() > expiry;
}

/**
 * Clears all authentication data from localStorage
 */
export function clearAuthSession() {
  localStorage.removeItem('token');
  localStorage.removeItem('roleToken');
  localStorage.removeItem('username');
  localStorage.removeItem(AUTH_EXPIRY_KEY);
}

/**
 * Ensures authentication session is fresh, clears if expired
 * @returns {boolean} True if session was expired and cleared
 */
export function ensureAuthFreshness() {
  if (isAuthExpired()) {
    clearAuthSession();
    return true;
  }
  return false;
}

/**
 * Schedules automatic session cleanup when token expires
 */
export function scheduleAuthExpiryTimer() {
  if (clearTimerId) {
    clearTimeout(clearTimerId);
    clearTimerId = null;
  }
  const expiry = Number(localStorage.getItem(AUTH_EXPIRY_KEY));
  if (!expiry) return;
  const delay = Math.max(0, expiry - Date.now());
  clearTimerId = setTimeout(() => {
    clearAuthSession();
  }, delay);
}


