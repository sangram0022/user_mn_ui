import React from 'react';
import styled from 'styled-components';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
}

const SpinnerContainer = styled.div<{ size: string }>`
  display: inline-block;
  width: ${(props) => {
    switch (props.size) {
      case 'sm':
        return '1rem';
      case 'lg':
        return '3rem';
      default:
        return '2rem';
    }
  }};
  height: ${(props) => {
    switch (props.size) {
      case 'sm':
        return '1rem';
      case 'lg':
        return '3rem';
      default:
        return '2rem';
    }
  }};
`;

const Spinner = styled.div<{ color: string }>`
  width: 100%;
  height: 100%;
  border: 2px solid ${(props) => props.theme.colors.light};
  border-top: 2px solid ${(props) => props.color || props.theme.colors.primary};
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', color, className }) => {
  return (
    <SpinnerContainer size={size} className={className} role="status" aria-label="Loading">
      <Spinner color={color} />
    </SpinnerContainer>
  );
};

export default LoadingSpinner;
