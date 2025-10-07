import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import LoginPage from '@pages/auth/LoginPage';

const loginMock = vi.fn();
const handleErrorMock = vi.fn();
const clearErrorMock = vi.fn();
const navigateMock = vi.fn();

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    login: loginMock,
  }),
}));

vi.mock('../../hooks/errors/useErrorHandler', () => ({
  useErrorHandler: () => ({
    error: null,
    handleError: handleErrorMock,
    clearError: clearErrorMock,
  }),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

const setup = async () => {
  const user = userEvent.setup();
  render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>
  );
  const emailInput = screen.getByLabelText(/email address/i);
  const passwordInput = screen.getByLabelText(/password/i);
  const submitButton = screen.getByRole('button', { name: /sign in/i });
  return { user, emailInput, passwordInput, submitButton };
};

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    loginMock.mockReset();
  });

  it('submits credentials and navigates on success', async () => {
    loginMock.mockResolvedValueOnce({});
    const { user, emailInput, passwordInput, submitButton } = await setup();

    await user.type(emailInput, 'user@example.com');
    await user.type(passwordInput, 'StrongP@ss1');
    await user.click(submitButton);

    await waitFor(() => {
      expect(loginMock).toHaveBeenCalledWith({ email: 'user@example.com', password: 'StrongP@ss1' });
      expect(navigateMock).toHaveBeenCalledWith('/dashboard');
    });

    expect(clearErrorMock).toHaveBeenCalled();
  });

  it('handles login failure and reports error', async () => {
    const error = new Error('Invalid credentials');
    loginMock.mockRejectedValueOnce(error);
    const { user, emailInput, passwordInput, submitButton } = await setup();

    await user.type(emailInput, 'user@example.com');
    await user.type(passwordInput, 'WrongPass1');
    await user.click(submitButton);

    await waitFor(() => {
      expect(handleErrorMock).toHaveBeenCalledWith(error);
    });

    expect(navigateMock).not.toHaveBeenCalled();
  });
});
