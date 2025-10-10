/**
 * Shared test utilities and helper functions
 */
import React from 'react';
import { render } from '@testing-library/react';
import type { RenderOptions } from '@testing-library/react';
import { AllTheProviders } from './TestProviders';

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options });

// Export render utilities
export { customRender as render };
export type { RenderOptions };
export { screen, fireEvent, waitFor } from '@testing-library/react';