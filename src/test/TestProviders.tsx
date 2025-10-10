/**
 * Test Providers Component
 */
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@features/auth/providers/AuthProvider';

// Test providers wrapper component
export const AllTheProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <BrowserRouter>
      <AuthProvider>
        {children}
      </AuthProvider>
    </BrowserRouter>
  );
};

export default AllTheProviders;