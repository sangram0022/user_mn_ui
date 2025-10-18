/**
 * MSW (Mock Service Worker) Server Setup
 *
 * Sets up mock API server for testing
 */

import { setupServer } from 'msw/node';

/**
 * Mock API handlers will be defined per test
 * This creates a server instance that can be configured with handlers
 */
export const server = setupServer();

// Enable request interception for tests
export const handlers = [];
