import {
  setAuthSession,
  isAuthExpired,
  clearAuthSession,
  ensureAuthFreshness,
  scheduleAuthExpiryTimer,
  AUTH_EXPIRY_KEY
} from './authSession';

describe('authSession', () => {
  const originalDateNow = Date.now;

  beforeEach(() => {
    // Limpiar localStorage antes de cada test
    localStorage.clear();
    jest.clearAllMocks();

    // Mock de Date.now
    Date.now = jest.fn(() => 1000000);

    // Spy en dispatchEvent
    jest.spyOn(window, 'dispatchEvent');

    jest.clearAllTimers();
    jest.useFakeTimers();
  });

  afterEach(() => {
    Date.now = originalDateNow;
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  describe('setAuthSession', () => {
    test('debe guardar token en localStorage', () => {
      setAuthSession({ token: 'test-token' });

      expect(localStorage.getItem('token')).toBe('test-token');
    });

    test('debe guardar roleToken en localStorage', () => {
      setAuthSession({ roleToken: 'role-token' });

      expect(localStorage.getItem('roleToken')).toBe('role-token');
    });

    test('debe guardar username en localStorage', () => {
      setAuthSession({ username: 'testuser' });

      expect(localStorage.getItem('username')).toBe('testuser');
    });

    test('debe establecer tiempo de expiración por defecto (1 hora)', () => {
      const currentTime = 1000000;
      Date.now = jest.fn(() => currentTime);

      setAuthSession({ token: 'test-token' });

      const expectedExpiry = currentTime + 60 * 60 * 1000; // 1 hora
      expect(localStorage.getItem(AUTH_EXPIRY_KEY)).toBe(String(expectedExpiry));
    });

    test('debe permitir configurar tiempo de expiración personalizado', () => {
      const currentTime = 1000000;
      Date.now = jest.fn(() => currentTime);
      const customExpiry = 30 * 60 * 1000; // 30 minutos

      setAuthSession({ token: 'test-token', expiryMs: customExpiry });

      const expectedExpiry = currentTime + customExpiry;
      expect(localStorage.getItem(AUTH_EXPIRY_KEY)).toBe(String(expectedExpiry));
    });

    test('debe disparar evento authChange', () => {
      setAuthSession({ token: 'test-token' });

      expect(window.dispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'authChange' })
      );
    });

    test('debe poder guardar múltiples valores a la vez', () => {
      setAuthSession({
        token: 'test-token',
        roleToken: 'role-token',
        username: 'testuser'
      });

      expect(localStorage.getItem('token')).toBe('test-token');
      expect(localStorage.getItem('roleToken')).toBe('role-token');
      expect(localStorage.getItem('username')).toBe('testuser');
    });

    test('no debe guardar valores undefined', () => {
      setAuthSession({ token: undefined, roleToken: undefined });

      expect(localStorage.getItem('token')).toBe(null);
      expect(localStorage.getItem('roleToken')).toBe(null);
      // Solo debe existir AUTH_EXPIRY_KEY
      expect(localStorage.getItem(AUTH_EXPIRY_KEY)).toBeTruthy();
    });
  });

  describe('isAuthExpired', () => {
    test('debe retornar false si no hay expiración establecida', () => {
      expect(isAuthExpired()).toBe(false);
    });

    test('debe retornar false si la sesión aún no ha expirado', () => {
      const currentTime = 1000000;
      const futureExpiry = currentTime + 10000;

      Date.now = jest.fn(() => currentTime);
      localStorage.setItem(AUTH_EXPIRY_KEY, String(futureExpiry));

      expect(isAuthExpired()).toBe(false);
    });

    test('debe retornar true si la sesión ha expirado', () => {
      const currentTime = 1000000;
      const pastExpiry = currentTime - 10000;

      Date.now = jest.fn(() => currentTime);
      localStorage.setItem(AUTH_EXPIRY_KEY, String(pastExpiry));

      expect(isAuthExpired()).toBe(true);
    });

    test('debe retornar false si la expiración es exactamente ahora', () => {
      const currentTime = 1000000;

      Date.now = jest.fn(() => currentTime);
      localStorage.setItem(AUTH_EXPIRY_KEY, String(currentTime));

      expect(isAuthExpired()).toBe(false);
    });
  });

  describe('clearAuthSession', () => {
    test('debe eliminar token de localStorage', () => {
      localStorage.setItem('token', 'test-token');
      clearAuthSession();

      expect(localStorage.getItem('token')).toBe(null);
    });

    test('debe eliminar roleToken de localStorage', () => {
      localStorage.setItem('roleToken', 'role-token');
      clearAuthSession();

      expect(localStorage.getItem('roleToken')).toBe(null);
    });

    test('debe eliminar username de localStorage', () => {
      localStorage.setItem('username', 'testuser');
      clearAuthSession();

      expect(localStorage.getItem('username')).toBe(null);
    });

    test('debe eliminar authExpiry de localStorage', () => {
      localStorage.setItem(AUTH_EXPIRY_KEY, '123456');
      clearAuthSession();

      expect(localStorage.getItem(AUTH_EXPIRY_KEY)).toBe(null);
    });

    test('debe disparar evento authChange', () => {
      clearAuthSession();

      expect(window.dispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'authChange' })
      );
    });

    test('debe eliminar todos los items de autenticación', () => {
      localStorage.setItem('token', 'test');
      localStorage.setItem('roleToken', 'test');
      localStorage.setItem('username', 'test');
      localStorage.setItem(AUTH_EXPIRY_KEY, 'test');

      clearAuthSession();

      expect(localStorage.length).toBe(0);
    });
  });

  describe('ensureAuthFreshness', () => {
    test('debe retornar false si la sesión no ha expirado', () => {
      const currentTime = 1000000;
      const futureExpiry = currentTime + 10000;

      Date.now = jest.fn(() => currentTime);
      localStorage.setItem(AUTH_EXPIRY_KEY, String(futureExpiry));

      expect(ensureAuthFreshness()).toBe(false);
    });

    test('debe retornar true y limpiar la sesión si ha expirado', () => {
      const currentTime = 1000000;
      const pastExpiry = currentTime - 10000;

      Date.now = jest.fn(() => currentTime);
      localStorage.setItem(AUTH_EXPIRY_KEY, String(pastExpiry));
      localStorage.setItem('token', 'test');

      expect(ensureAuthFreshness()).toBe(true);
      expect(localStorage.getItem('token')).toBe(null);
    });

    test('debe disparar authChange si la sesión ha expirado', () => {
      const currentTime = 1000000;
      const pastExpiry = currentTime - 10000;

      Date.now = jest.fn(() => currentTime);
      localStorage.setItem(AUTH_EXPIRY_KEY, String(pastExpiry));

      ensureAuthFreshness();

      expect(window.dispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'authChange' })
      );
    });
  });

  describe('scheduleAuthExpiryTimer', () => {
    test('debe programar limpieza automática cuando expire el token', () => {
      const currentTime = 1000000;
      const expiryTime = currentTime + 5000;

      Date.now = jest.fn(() => currentTime);
      localStorage.setItem(AUTH_EXPIRY_KEY, String(expiryTime));
      localStorage.setItem('token', 'test');

      scheduleAuthExpiryTimer();

      // Avanzar el tiempo hasta justo antes de la expiración
      jest.advanceTimersByTime(4999);
      expect(localStorage.getItem('token')).toBe('test');

      // Avanzar al momento de expiración
      jest.advanceTimersByTime(1);
      expect(localStorage.getItem('token')).toBe(null);
    });

    test('no debe programar timer si no hay expiración establecida', () => {
      localStorage.setItem('token', 'test');

      scheduleAuthExpiryTimer();

      jest.advanceTimersByTime(100000);
      expect(localStorage.getItem('token')).toBe('test');
    });

    test('debe limpiar timer anterior si existe', () => {
      const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');
      const currentTime = 1000000;

      Date.now = jest.fn(() => currentTime);
      localStorage.setItem(AUTH_EXPIRY_KEY, String(currentTime + 5000));

      // Programar primer timer
      scheduleAuthExpiryTimer();

      // Programar segundo timer
      scheduleAuthExpiryTimer();

      expect(clearTimeoutSpy).toHaveBeenCalled();
      clearTimeoutSpy.mockRestore();
    });

    test('debe manejar expiración ya pasada', () => {
      const currentTime = 1000000;
      const pastExpiry = currentTime - 1000;

      Date.now = jest.fn(() => currentTime);
      localStorage.setItem(AUTH_EXPIRY_KEY, String(pastExpiry));
      localStorage.setItem('token', 'test');

      scheduleAuthExpiryTimer();

      // Debe ejecutar inmediatamente (delay = 0)
      jest.advanceTimersByTime(0);
      expect(localStorage.getItem('token')).toBe(null);
    });
  });
});