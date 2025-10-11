import { User, UserSession } from '../types/auth.types';
import { TokenService } from './TokenService';

const SESSION_KEY = 'user_session';
const DEVICE_INFO_KEY = 'device_info';

export class SessionService {
  static createSession(user: User, sessionId: string): UserSession {
    const session: UserSession = {
      user,
      token: {
        accessToken: TokenService.getToken() || '',
        refreshToken: TokenService.getRefreshToken() || '',
        tokenType: 'Bearer',
        expiresIn: 3600,
        expiresAt: new Date(Date.now() + 3600 * 1000),
      },
      sessionId,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      deviceInfo: this.getDeviceInfo(),
    };

    this.saveSession(session);
    return session;
  }

  static saveSession(session: UserSession): void {
    try {
      localStorage.setItem(
        SESSION_KEY,
        JSON.stringify({
          ...session,
          createdAt: session.createdAt.toISOString(),
          expiresAt: session.expiresAt.toISOString(),
          token: {
            ...session.token,
            expiresAt: session.token.expiresAt.toISOString(),
          },
        })
      );
    } catch (error) {
      console.error('Failed to save session:', error);
    }
  }

  static getSession(): UserSession | null {
    try {
      const sessionData = localStorage.getItem(SESSION_KEY);
      if (!sessionData) {
        return null;
      }

      const session = JSON.parse(sessionData);
      return {
        ...session,
        createdAt: new Date(session.createdAt),
        expiresAt: new Date(session.expiresAt),
        token: {
          ...session.token,
          expiresAt: new Date(session.token.expiresAt),
        },
      };
    } catch (error) {
      console.error('Failed to get session:', error);
      return null;
    }
  }

  static updateSession(updates: Partial<UserSession>): void {
    const currentSession = this.getSession();
    if (currentSession) {
      const updatedSession = { ...currentSession, ...updates };
      this.saveSession(updatedSession);
    }
  }

  static clearSession(): void {
    localStorage.removeItem(SESSION_KEY);
    TokenService.clearTokens();
  }

  static isSessionValid(): boolean {
    const session = this.getSession();
    if (!session) {
      return false;
    }

    // Check if session has expired
    if (new Date() > session.expiresAt) {
      this.clearSession();
      return false;
    }

    // Check if token is valid
    if (!TokenService.isTokenValid()) {
      return false;
    }

    return true;
  }

  static getDeviceInfo() {
    const userAgent = navigator.userAgent;
    const platform = navigator.platform;

    // Simple device detection
    let device = 'desktop';
    if (/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
      device = 'mobile';
    } else if (/iPad/i.test(userAgent)) {
      device = 'tablet';
    }

    const deviceInfo = {
      userAgent,
      device,
      platform,
      timestamp: new Date().toISOString(),
    };

    localStorage.setItem(DEVICE_INFO_KEY, JSON.stringify(deviceInfo));
    return deviceInfo;
  }

  static extendSession(hours: number = 24): void {
    const session = this.getSession();
    if (session) {
      session.expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000);
      this.saveSession(session);
    }
  }

  static getSessionInfo() {
    const session = this.getSession();
    if (!session) {
      return null;
    }

    return {
      sessionId: session.sessionId,
      createdAt: session.createdAt,
      expiresAt: session.expiresAt,
      deviceInfo: session.deviceInfo,
      isValid: this.isSessionValid(),
      timeRemaining: session.expiresAt.getTime() - Date.now(),
    };
  }
}
