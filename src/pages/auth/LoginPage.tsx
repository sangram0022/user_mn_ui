import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useAuth } from '../../hooks/useAuth';

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: ${(props) => props.theme.colors.light};
`;

const LoginForm = styled.form`
  background: ${(props) => props.theme.colors.white};
  padding: ${(props) => props.theme.spacing.xl};
  border-radius: ${(props) => props.theme.borderRadius.lg};
  box-shadow: ${(props) => props.theme.shadows.lg};
  width: 100%;
  max-width: 400px;
`;

const Title = styled.h1`
  text-align: center;
  margin-bottom: ${(props) => props.theme.spacing.lg};
  color: ${(props) => props.theme.colors.dark};
`;

const FormGroup = styled.div`
  margin-bottom: ${(props) => props.theme.spacing.md};
`;

const Label = styled.label`
  display: block;
  margin-bottom: ${(props) => props.theme.spacing.sm};
  font-weight: 500;
  color: ${(props) => props.theme.colors.dark};
`;

const Input = styled.input`
  width: 100%;
  padding: ${(props) => props.theme.spacing.sm} ${(props) => props.theme.spacing.md};
  border: 1px solid ${(props) => props.theme.colors.gray}40;
  border-radius: ${(props) => props.theme.borderRadius.md};
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: ${(props) => props.theme.colors.primary};
    box-shadow: 0 0 0 2px ${(props) => props.theme.colors.primary}20;
  }
`;

const Button = styled.button`
  width: 100%;
  padding: ${(props) => props.theme.spacing.md};
  background-color: ${(props) => props.theme.colors.primary};
  color: ${(props) => props.theme.colors.white};
  border-radius: ${(props) => props.theme.borderRadius.md};
  font-size: 1rem;
  font-weight: 500;
  margin-top: ${(props) => props.theme.spacing.md};

  &:hover:not(:disabled) {
    background-color: ${(props) => props.theme.colors.primary}dd;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  color: ${(props) => props.theme.colors.danger};
  margin-bottom: ${(props) => props.theme.spacing.md};
  font-size: 0.9rem;
`;

const LinkText = styled.p`
  text-align: center;
  margin-top: ${(props) => props.theme.spacing.lg};
  color: ${(props) => props.theme.colors.gray};

  a {
    color: ${(props) => props.theme.colors.primary};
    font-weight: 500;
  }
`;

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error, clearError } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    await login({ email, password });
  };

  return (
    <Container>
      <LoginForm onSubmit={handleSubmit}>
        <Title>Sign In</Title>

        {error && <ErrorMessage>{error}</ErrorMessage>}

        <FormGroup>
          <Label htmlFor="email">Email</Label>
          <Input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
          />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="password">Password</Label>
          <Input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
          />
        </FormGroup>

        <Button type="submit" disabled={isLoading}>
          {isLoading ? <LoadingSpinner size="sm" /> : 'Sign In'}
        </Button>

        <LinkText>
          Don't have an account? <Link to="/register">Sign up</Link>
        </LinkText>
      </LoginForm>
    </Container>
  );
};

export default LoginPage;
