/**
 * Tests for Input Sanitization Utilities
 *
 * Tests XSS protection and input validation.
 */

import { describe, expect, it } from 'vitest';
import {
  sanitizeEmail,
  sanitizeFilename,
  sanitizeHTML,
  sanitizeInput,
  sanitizeJSON,
  sanitizeURL,
} from '../sanitization';

describe('sanitization utilities', () => {
  describe('sanitizeHTML', () => {
    it('should remove script tags', () => {
      const input = '<script>alert("xss")</script><p>Hello</p>';
      const result = sanitizeHTML(input);
      expect(result).not.toContain('<script>');
      expect(result).toContain('<p>Hello</p>');
    });

    it('should remove dangerous event handlers', () => {
      const input = '<div onclick="alert(1)">Click me</div>';
      const result = sanitizeHTML(input);
      expect(result).not.toContain('onclick');
    });

    it('should allow safe tags', () => {
      const input = '<p><strong>Bold</strong> and <em>italic</em></p>';
      const result = sanitizeHTML(input);
      expect(result).toContain('<strong>');
      expect(result).toContain('<em>');
    });

    it('should handle empty input', () => {
      expect(sanitizeHTML('')).toBe('');
    });

    it('should respect custom allowed tags', () => {
      const input = '<div><p>Paragraph</p></div>';
      const result = sanitizeHTML(input, { allowedTags: ['div'] });
      expect(result).toContain('<div>');
      expect(result).not.toContain('<p>');
    });
  });

  describe('sanitizeInput', () => {
    it('should remove HTML tags', () => {
      const input = '<script>alert(1)</script>John Doe';
      const result = sanitizeInput(input);
      expect(result).toBe('John Doe');
    });

    it('should trim whitespace', () => {
      const input = '  John Doe  ';
      const result = sanitizeInput(input);
      expect(result).toBe('John Doe');
    });

    it('should limit length', () => {
      const input = 'a'.repeat(2000);
      const result = sanitizeInput(input, 100);
      expect(result).toHaveLength(100);
    });

    it('should remove null bytes', () => {
      const input = 'Hello\0World';
      const result = sanitizeInput(input);
      expect(result).toBe('HelloWorld');
    });

    it('should handle empty input', () => {
      expect(sanitizeInput('')).toBe('');
    });
  });

  describe('sanitizeEmail', () => {
    it('should accept valid emails', () => {
      const email = 'user@example.com';
      const result = sanitizeEmail(email);
      expect(result).toBe('user@example.com');
    });

    it('should convert to lowercase', () => {
      const email = 'User@Example.COM';
      const result = sanitizeEmail(email);
      expect(result).toBe('user@example.com');
    });

    it('should reject invalid emails', () => {
      expect(sanitizeEmail('not-an-email')).toBe('');
      expect(sanitizeEmail('missing@domain')).toBe('');
      expect(sanitizeEmail('@example.com')).toBe('');
    });

    it('should remove script tags from email', () => {
      const email = 'user@example.com<script>alert(1)</script>';
      const result = sanitizeEmail(email);
      expect(result).toBe('user@example.com');
    });
  });

  describe('sanitizeURL', () => {
    it('should accept valid HTTPS URLs', () => {
      const url = 'https://example.com/path';
      const result = sanitizeURL(url);
      expect(result).toBe('https://example.com/path');
    });

    it('should accept valid HTTP URLs', () => {
      const url = 'http://example.com';
      const result = sanitizeURL(url);
      expect(result).toBe('http://example.com/');
    });

    it('should block javascript: protocol', () => {
      const url = 'javascript:alert(1)';
      const result = sanitizeURL(url);
      expect(result).toBe('');
    });

    it('should block data: protocol by default', () => {
      const url = 'data:text/html,<script>alert(1)</script>';
      const result = sanitizeURL(url);
      expect(result).toBe('');
    });

    it('should handle invalid URLs', () => {
      expect(sanitizeURL('not a url')).toBe('');
      expect(sanitizeURL('htp://broken')).toBe('');
    });

    it('should respect custom allowed protocols', () => {
      const url = 'ftp://example.com';
      const result = sanitizeURL(url, ['ftp']);
      expect(result).toBe('ftp://example.com/');
    });
  });

  describe('sanitizeFilename', () => {
    it('should remove path traversal attempts', () => {
      const filename = '../../../etc/passwd';
      const result = sanitizeFilename(filename);
      expect(result).not.toContain('..');
      expect(result).toBe('etcpasswd');
    });

    it('should remove path separators', () => {
      const filename = 'folder/file.txt';
      const result = sanitizeFilename(filename);
      expect(result).toBe('folderfile.txt');
    });

    it('should limit length', () => {
      const filename = 'a'.repeat(300) + '.txt';
      const result = sanitizeFilename(filename);
      expect(result.length).toBeLessThanOrEqual(255);
    });

    it('should handle valid filenames', () => {
      const filename = 'document.pdf';
      const result = sanitizeFilename(filename);
      expect(result).toBe('document.pdf');
    });
  });

  describe('sanitizeJSON', () => {
    it('should parse valid JSON', () => {
      const json = '{"name":"John","age":30}';
      const result = sanitizeJSON(json);
      expect(result).toEqual({ name: 'John', age: 30 });
    });

    it('should prevent prototype pollution', () => {
      const json = '{"__proto__":{"admin":true}}';
      const result = sanitizeJSON(json);
      expect(result).not.toHaveProperty('__proto__');
    });

    it('should remove constructor property', () => {
      const json = '{"constructor":{"admin":true}}';
      const result = sanitizeJSON(json);
      expect(result).not.toHaveProperty('constructor');
    });

    it('should return null for invalid JSON', () => {
      expect(sanitizeJSON('not json')).toBeNull();
      expect(sanitizeJSON('{')).toBeNull();
    });

    it('should handle empty objects', () => {
      const json = '{}';
      const result = sanitizeJSON(json);
      expect(result).toEqual({});
    });
  });
});
