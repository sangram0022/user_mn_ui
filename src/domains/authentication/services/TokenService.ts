import { AuthToken } from '../types/auth.types';

const TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

export class TokenService {
  static getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  static getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  static setTokens(token: AuthToken): void {
    localStorage.setItem(TOKEN_KEY, token.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, token.refreshToken);
  }

  static clearTokens(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }

  static isTokenExpired(token?: string): boolean {
    const tokenToCheck = token || this.getToken();

    if (!tokenToCheck) {
      return true;
    }

    try {
      const payload = JSON.parse(atob(tokenToCheck.split('.')[1]));
      const now = Date.now() / 1000;
      return payload.exp < now;
    } catch (error) {
      console.error('Failed to parse token:', error);
      return true;
    }
  }

  static getTokenPayload(token?: string): Record<string, unknown> | null {
    const tokenToCheck = token || this.getToken();

    if (!tokenToCheck) {
      return null;
    }

    try {
      return JSON.parse(atob(tokenToCheck.split('.')[1]));
    } catch (error) {
      console.error('Failed to parse token:', error);
      return null;
    }
  }

  static getExpirationTime(token?: string): Date | null {
    const payload = this.getTokenPayload(token);
    return payload?.exp && typeof payload.exp === 'number' ? new Date(payload.exp * 1000) : null;
  }

  static isTokenValid(token?: string): boolean {
    const tokenToCheck = token || this.getToken();

    if (!tokenToCheck) {
      return false;
    }

    return !this.isTokenExpired(tokenToCheck);
  }
}
