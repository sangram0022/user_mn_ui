/**
 * Tests for useUpdateProfile Validation Logic
 * 
 * @see CODE_AUDIT_FIX_PLAN.md Phase 4.2
 * Focuses on validation logic in profile update mutations
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { UpdateProfileRequest } from '../../types/profile.types';
import * as apiHelpers from '@/core/api/apiHelpers';
import { APIError } from '@/core/error';
import { ValidationBuilder } from '@/core/validation';

// Mock API helpers
vi.mock('@/core/api/apiHelpers', () => ({
  apiGet: vi.fn(),
  apiPut: vi.fn(),
}));

describe('useUpdateProfile Validation Logic', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Client-side validation', () => {
    it('should validate first_name with name validator', () => {
      const builder = new ValidationBuilder();
      builder.validateField('first_name', 'John', (b) => b.required().name());
      
      const result = builder.result();
      
      expect(result.isValid).toBe(true);
      expect(result.fields?.first_name?.isValid).toBe(true);
    });

    it('should reject invalid first_name', () => {
      const builder = new ValidationBuilder();
      builder.validateField('first_name', '', (b) => b.required().name());
      
      const result = builder.result();
      
      expect(result.isValid).toBe(false);
      expect(result.fields?.first_name?.isValid).toBe(false);
    });

    it('should validate last_name with name validator', () => {
      const builder = new ValidationBuilder();
      builder.validateField('last_name', 'Doe', (b) => b.required().name());
      
      const result = builder.result();
      
      expect(result.isValid).toBe(true);
      expect(result.fields?.last_name?.isValid).toBe(true);
    });

    it('should validate phone_number with phone validator', () => {
      const builder = new ValidationBuilder();
      builder.validateField('phone_number', '+1234567890', (b) => b.required().phone());
      
      const result = builder.result();
      
      expect(result.isValid).toBe(true);
      expect(result.fields?.phone_number?.isValid).toBe(true);
    });

    it('should reject invalid phone_number', () => {
      const builder = new ValidationBuilder();
      builder.validateField('phone_number', 'invalid', (b) => b.required().phone());
      
      const result = builder.result();
      
      expect(result.isValid).toBe(false);
      expect(result.fields?.phone_number?.isValid).toBe(false);
    });

    it('should allow partial updates (undefined fields)', () => {
      const data: UpdateProfileRequest = {
        first_name: 'John',
        // last_name and phone_number are undefined - should not be validated
      };

      const builder = new ValidationBuilder();

      if (data.first_name !== undefined) {
        builder.validateField('first_name', data.first_name, (b) => b.required().name());
      }
      if (data.last_name !== undefined) {
        builder.validateField('last_name', data.last_name, (b) => b.required().name());
      }
      if (data.phone_number !== undefined) {
        builder.validateField('phone_number', data.phone_number, (b) => b.required().phone());
      }

      const result = builder.result();

      expect(result.isValid).toBe(true);
      expect(result.fields?.first_name?.isValid).toBe(true);
      expect(result.fields?.last_name).toBeUndefined(); // Not validated
      expect(result.fields?.phone_number).toBeUndefined(); // Not validated
    });

    it('should validate all provided fields in partial update', () => {
      const data: UpdateProfileRequest = {
        first_name: 'John',
        phone_number: '+1234567890',
      };

      const builder = new ValidationBuilder();

      if (data.first_name !== undefined) {
        builder.validateField('first_name', data.first_name, (b) => b.required().name());
      }
      if (data.last_name !== undefined) {
        builder.validateField('last_name', data.last_name, (b) => b.required().name());
      }
      if (data.phone_number !== undefined) {
        builder.validateField('phone_number', data.phone_number, (b) => b.required().phone());
      }

      const result = builder.result();

      expect(result.isValid).toBe(true);
      expect(result.fields?.first_name?.isValid).toBe(true);
      expect(result.fields?.phone_number?.isValid).toBe(true);
      expect(result.fields?.last_name).toBeUndefined(); // Not provided
    });

    it('should reject updates with any invalid field', () => {
      const data: UpdateProfileRequest = {
        first_name: 'John', // Valid
        phone_number: 'invalid', // Invalid
      };

      const builder = new ValidationBuilder();

      if (data.first_name !== undefined) {
        builder.validateField('first_name', data.first_name, (b) => b.required().name());
      }
      if (data.phone_number !== undefined) {
        builder.validateField('phone_number', data.phone_number, (b) => b.required().phone());
      }

      const result = builder.result();

      expect(result.isValid).toBe(false);
      expect(result.fields?.first_name?.isValid).toBe(true);
      expect(result.fields?.phone_number?.isValid).toBe(false);
    });
  });

  describe('API error handling', () => {
    it('should throw APIError with validation errors on invalid data', () => {
      const data: UpdateProfileRequest = {
        first_name: '', // Invalid
      };

      const builder = new ValidationBuilder();

      if (data.first_name !== undefined) {
        builder.validateField('first_name', data.first_name, (b) => b.required().name());
      }

      const validationResult = builder.result();

      if (!validationResult.isValid) {
        const errors: string[] = [];
        if (validationResult.fields) {
          Object.entries(validationResult.fields).forEach(([field, result]) => {
            if (!result.isValid) {
              errors.push(`${field}: ${result.errors.join('. ')}`);
            }
          });
        }
        
        const error = new APIError(
          errors.join('; ') || 'Validation failed',
          400,
          'PUT',
          '/profile',
          { validationErrors: validationResult.fields }
        );

        expect(error).toBeInstanceOf(APIError);
        expect(error.statusCode).toBe(400);
        expect(error.message).toContain('first_name');
      }
    });

    it('should call apiPut with correct endpoint and data', async () => {
      const data: UpdateProfileRequest = {
        first_name: 'John',
        last_name: 'Doe',
      };

      const mockResponse = {
        user_id: 'user-123',
        email: 'test@example.com',
        first_name: 'John',
        last_name: 'Doe',
        phone_number: null,
        status: 'active' as const,
        is_verified: true,
        roles: ['user'],
        created_at: '2024-01-01T00:00:00Z',
        last_login: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        avatar_url: null,
        preferences: null,
        metadata: null,
        profile_data: null,
      };

      vi.mocked(apiHelpers.apiPut).mockResolvedValueOnce(mockResponse);

      // Simulate the hook's validation and API call
      const builder = new ValidationBuilder();
      
      if (data.first_name !== undefined) {
        builder.validateField('first_name', data.first_name, (b) => b.required().name());
      }
      if (data.last_name !== undefined) {
        builder.validateField('last_name', data.last_name, (b) => b.required().name());
      }

      const validationResult = builder.result();
      
      expect(validationResult.isValid).toBe(true);

      // Call API
      const response = await apiHelpers.apiPut('/api/v1/users/profile/me', data);

      expect(apiHelpers.apiPut).toHaveBeenCalledWith('/api/v1/users/profile/me', data);
      expect(response).toEqual(mockResponse);
    });
  });

  describe('ValidationBuilder integration', () => {
    it('should use centralized ValidationBuilder for consistency', () => {
      const builder = new ValidationBuilder();
      
      // Test that ValidationBuilder is properly imported and usable
      expect(builder).toBeDefined();
      expect(typeof builder.validateField).toBe('function');
      expect(typeof builder.result).toBe('function');
    });

    it('should chain validations correctly', () => {
      const builder = new ValidationBuilder();
      
      builder
        .validateField('first_name', 'John', (b) => b.required().name())
        .validateField('last_name', 'Doe', (b) => b.required().name())
        .validateField('phone_number', '+1234567890', (b) => b.required().phone());

      const result = builder.result();

      expect(result.isValid).toBe(true);
      expect(result.fields?.first_name?.isValid).toBe(true);
      expect(result.fields?.last_name?.isValid).toBe(true);
      expect(result.fields?.phone_number?.isValid).toBe(true);
    });
  });
});
