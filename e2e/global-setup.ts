import { server } from './mocks/server';

export default async function globalSetup() {
  // Start MSW server before all tests
  server.listen({
    onUnhandledRequest: 'warn',
  });

  console.warn('🔶 MSW server started');
}

export async function globalTeardown() {
  // Clean up after all tests
  server.close();
  console.warn('🔶 MSW server stopped');
}
