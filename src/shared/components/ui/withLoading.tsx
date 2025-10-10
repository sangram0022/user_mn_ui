/**
 * Loading Higher-Order Component
 */
import React from 'react';
import Loading, { type LoadingProps } from './Loading';

// HOC for adding loading state to components
export function withLoading<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  loadingProps?: Partial<LoadingProps>
) {
  const WithLoadingComponent = (props: P & { isLoading?: boolean }) => {
    const { isLoading, ...restProps } = props;
    
    if (isLoading) {
      return <Loading {...loadingProps} />;
    }
    
    return <WrappedComponent {...(restProps as P)} />;
  };
  
  WithLoadingComponent.displayName = `withLoading(${WrappedComponent.displayName || WrappedComponent.name})`;
  
  return WithLoadingComponent;
}

export default withLoading;