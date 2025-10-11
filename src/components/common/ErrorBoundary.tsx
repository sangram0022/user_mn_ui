import { Component, ErrorInfo, ReactNode } from 'react';
import styled from 'styled-components';

// Theme type definition
interface Theme {
  colors: {
    primary: string;
    danger: string;
    gray: string;
    white: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
}

interface ThemeProps {
  theme: Theme;
}

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

const ErrorContainer = styled.div<ThemeProps>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: ${(props: ThemeProps) => props.theme.spacing.xl};
  text-align: center;
`;

const ErrorTitle = styled.h2<ThemeProps>`
  color: ${(props: ThemeProps) => props.theme.colors.danger};
  margin-bottom: ${(props: ThemeProps) => props.theme.spacing.md};
`;

const ErrorMessage = styled.p<ThemeProps>`
  color: ${(props: ThemeProps) => props.theme.colors.gray};
  margin-bottom: ${(props: ThemeProps) => props.theme.spacing.lg};
  max-width: 600px;
`;

const RetryButton = styled.button<ThemeProps>`
  padding: ${(props: ThemeProps) => props.theme.spacing.sm}
    ${(props: ThemeProps) => props.theme.spacing.md};
  background-color: ${(props: ThemeProps) => props.theme.colors.primary};
  color: ${(props: ThemeProps) => props.theme.colors.white};
  border-radius: ${(props: ThemeProps) => props.theme.borderRadius.md};
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${(props: ThemeProps) => props.theme.colors.primary}dd;
  }
`;

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    // You can log this to an error reporting service
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: undefined });
  };

  override render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorContainer>
          <ErrorTitle>Something went wrong</ErrorTitle>
          <ErrorMessage>
            We're sorry, but something unexpected happened. Please try refreshing the page.
          </ErrorMessage>
          {import.meta.env.DEV && this.state.error && (
            <details style={{ marginBottom: '1rem', textAlign: 'left' }}>
              <summary>Error Details (Development)</summary>
              <pre style={{ fontSize: '0.8rem', color: '#666' }}>{this.state.error.toString()}</pre>
            </details>
          )}
          <RetryButton onClick={this.handleRetry}>Try Again</RetryButton>
        </ErrorContainer>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
