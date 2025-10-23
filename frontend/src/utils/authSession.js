/**
 * @file Utilidades para gestión de sesión de autenticación
 * @module utils/authSession
 * @description Maneja el almacenamiento de sesión de autenticación, seguimiento de expiración y limpieza automática
 */

export const AUTH_EXPIRY_KEY = 'authExpiry';

let clearTimerId = null;

/**
 * Establece los datos de sesión de autenticación en localStorage
 * @param {Object} params - Parámetros de autenticación
 * @param {string} [params.token] - Token de autenticación JWT
 * @param {string} [params.roleToken] - Token JWT basado en roles
 * @param {string} [params.username] - Nombre de usuario
 * @param {number} [params.expiryMs=3600000] - Tiempo de expiración de sesión en milisegundos (por defecto: 1 hora)
 */
export function setAuthSession({ token, roleToken, username, expiryMs = 60 * 60 * 1000 }) {
  if (token) localStorage.setItem('token', token);
  if (roleToken) localStorage.setItem('roleToken', roleToken);
  if (username) localStorage.setItem('username', username);
  const expiryAt = Date.now() + expiryMs;
  localStorage.setItem(AUTH_EXPIRY_KEY, String(expiryAt));

  // Disparar evento personalizado para notificar cambios en la autenticación
  window.dispatchEvent(new Event('authChange'));
}

/**
 * Verifica si la sesión de autenticación actual ha expirado
 * @returns {boolean} Verdadero si la sesión ha expirado
 */
export function isAuthExpired() {
  const expiry = Number(localStorage.getItem(AUTH_EXPIRY_KEY));
  if (!expiry) return false;
  return Date.now() > expiry;
}

/**
 * Limpia todos los datos de autenticación de localStorage
 */
export function clearAuthSession() {
  localStorage.removeItem('token');
  localStorage.removeItem('roleToken');
  localStorage.removeItem('username');
  localStorage.removeItem(AUTH_EXPIRY_KEY);

  // Disparar evento personalizado para notificar cambios en la autenticación
  window.dispatchEvent(new Event('authChange'));
}

/**
 * Asegura que la sesión de autenticación esté fresca, limpia si ha expirado
 * @returns {boolean} Verdadero si la sesión expiró y fue limpiada
 */
export function ensureAuthFreshness() {
  if (isAuthExpired()) {
    clearAuthSession();
    return true;
  }
  return false;
}

/**
 * Programa la limpieza automática de sesión cuando el token expire
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
