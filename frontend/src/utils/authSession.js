export const AUTH_EXPIRY_KEY = 'authExpiry';

let clearTimerId = null;

export function setAuthSession({ token, roleToken, username, expiryMs = 60 * 60 * 1000 }) {
  if (token) localStorage.setItem('token', token);
  if (roleToken) localStorage.setItem('roleToken', roleToken);
  if (username) localStorage.setItem('username', username);
  const expiryAt = Date.now() + expiryMs;
  localStorage.setItem(AUTH_EXPIRY_KEY, String(expiryAt));
}

export function isAuthExpired() {
  const expiry = Number(localStorage.getItem(AUTH_EXPIRY_KEY));
  if (!expiry) return false;
  return Date.now() > expiry;
}

export function clearAuthSession() {
  localStorage.removeItem('token');
  localStorage.removeItem('roleToken');
  localStorage.removeItem('username');
  localStorage.removeItem(AUTH_EXPIRY_KEY);
}

export function ensureAuthFreshness() {
  if (isAuthExpired()) {
    clearAuthSession();
    return true;
  }
  return false;
}

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


