import { storageService } from '@/core/storage';

// ========================================
// Form Persistence Utility
// ========================================

export class FormStateManager {
  private static PREFIX = 'form_persist_';

  static save(key: string, data: Record<string, unknown>, ttlHours = 24): void {
    // Use storageService with TTL support
    storageService.set(
      `${this.PREFIX}${key}`,
      data,
      { ttl: ttlHours * 60 * 60 * 1000 }
    );
  }

  static load(key: string): Record<string, unknown> | null {
    // storageService handles TTL automatically
    return storageService.get<Record<string, unknown>>(`${this.PREFIX}${key}`);
  }

  static clear(key: string): void {
    storageService.remove(`${this.PREFIX}${key}`);
  }
}
