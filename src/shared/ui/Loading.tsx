import React from 'react';
import { Loader } from 'lucide-react';

interface LoadingProps { size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'spinner' | 'dots' | 'pulse' | 'bars';
  text?: string;
  fullScreen?: boolean;
  overlay?: boolean;
  color?: string; }

const Loading: React.FC<LoadingProps> = ({ size = 'md',
  variant = 'spinner',
  text,
  fullScreen = false,
  overlay = false,
  color = '#3b82f6', }) => { const sizes = {
    sm: { icon: '1rem', text: '0.75rem', padding: '1rem' },
    md: { icon: '1.5rem', text: '0.875rem', padding: '1.5rem' },
    lg: { icon: '2rem', text: '1rem', padding: '2rem' },
    xl: { icon: '3rem', text: '1.125rem', padding: '2.5rem' },
  };

  const currentSize = sizes[size];

  const containerStyles: React.CSSProperties = { display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: text ? '1rem' : '0',
    padding: currentSize.padding,
    ...(fullScreen && {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: overlay ? 'rgba(255, 255, 255, 0.9)' : 'transparent',
      zIndex: 9999,
    }),
    ...(overlay && !fullScreen && { position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      zIndex: 10,
    }),
  };

  const renderLoadingIcon = () => { const iconStyle: React.CSSProperties = {
      width: currentSize.icon,
      height: currentSize.icon,
      color,
    };

    switch (variant) { case 'spinner':
        return (
          <Loader
            style={{
              ...iconStyle,
              animation: 'spin 1s linear infinite',
            }}
          />
        );
      case 'dots':
        return (
          <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                style={{
                  width: `calc(${currentSize.icon} * 0.2)`,
                  height: `calc(${currentSize.icon} * 0.2)`,
                  backgroundColor: color,
                  borderRadius: '50%',
                  animation: `loadingDots 1.4s ease-in-out infinite both`,
                  animationDelay: `${i * 0.16}s`,
                }}
              />
            ))}
          </div>
        );
      case 'pulse':
        return (
          <div
            style={{ width: currentSize.icon,
              height: currentSize.icon,
              backgroundColor: color,
              borderRadius: '50%',
              animation: 'loadingPulse 2s cubic-bezier(0.455, 0.03, 0.515, 0.955) infinite',
            }}
          />
        );
      case 'bars':
        return (
          <div style={{ display: 'flex', gap: '0.125rem', alignItems: 'end' }}>
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                style={{
                  width: `calc(${currentSize.icon} * 0.1)`,
                  height: `calc(${currentSize.icon} * ${0.3 + ((i % 2) * 0.3)})`,
                  backgroundColor: color,
                  borderRadius: '0.125rem',
                  animation: `loadingBars 1.2s ease-in-out infinite`,
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}
          </div>
        );
      default:
        return <Loader style={iconStyle} />;
    }
  };

  return (
    <>
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes loadingDots { 0%, 80%, 100% {
            transform: scale(0);
            opacity: 0.5;
          }
          40% { transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes loadingPulse { 0% {
            transform: scale(0);
            opacity: 1;
          }
          100% { transform: scale(1);
            opacity: 0;
          }
        }

        @keyframes loadingBars { 0%, 40%, 100% {
            transform: scaleY(0.4);
          }
          20% { transform: scaleY(1);
          }
        }
      `}</style>

      <div style={containerStyles}>
        {renderLoadingIcon()}
        {text && (
          <p
            style={ {
                fontSize: currentSize.text,
                color: '#6b7280',
                margin: 0,
                fontWeight: 500,
                textAlign: 'center',
              } as React.CSSProperties
            }
          >
            {text}
          </p>
        )}
      </div>
    </>
  );
};

export const LoadingSpinner: React.FC<Pick<LoadingProps, 'size' | 'color'>> = (props) => (
  <Loading variant="spinner" {...props} />
);

export const LoadingDots: React.FC<Pick<LoadingProps, 'size' | 'color'>> = (props) => (
  <Loading variant="dots" {...props} />
);

export const LoadingPulse: React.FC<Pick<LoadingProps, 'size' | 'color'>> = (props) => (
  <Loading variant="pulse" {...props} />
);

export const LoadingBars: React.FC<Pick<LoadingProps, 'size' | 'color'>> = (props) => (
  <Loading variant="bars" {...props} />
);

export const LoadingOverlay: React.FC<Pick<LoadingProps, 'text' | 'variant' | 'size'>> = (props) => (
  <Loading fullScreen overlay {...props} />
);

interface LoadingButtonProps { loading?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  style?: React.CSSProperties; }

export const LoadingButton: React.FC<LoadingButtonProps> = ({ loading = false,
  children,
  onClick,
  disabled = false,
  variant = 'primary',
  size = 'md',
  style,
  ...props }) => { const buttonSizes = {
    sm: { padding: '0.5rem 1rem', fontSize: '0.75rem', iconSize: '0.875rem' },
    md: { padding: '0.75rem 1.5rem', fontSize: '0.875rem', iconSize: '1rem' },
    lg: { padding: '1rem 2rem', fontSize: '1rem', iconSize: '1.25rem' },
  };

  const variants = { primary: {
      background: loading || disabled ? '#9ca3af' : 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
      color: 'white',
      border: 'none',
    },
    secondary: {
      background: 'white',
      color: loading || disabled ? '#9ca3af' : '#374151',
      border: `1px solid ${loading || disabled ? '#d1d5db' : '#d1d5db'}`,
    },
  };

  const currentSize = buttonSizes[size];
  const currentVariant = variants[variant];

  return (
    <button
      onClick={loading || disabled ? undefined : onClick}
      disabled={loading || disabled}
      style={{ display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        padding: currentSize.padding,
        fontSize: currentSize.fontSize,
        fontWeight: '600',
        borderRadius: '0.5rem',
        cursor: loading || disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s ease',
        ...currentVariant,
        ...style,
      }}
      {...props}
    >
      {loading && (
        <Loader
          style={{ width: currentSize.iconSize,
            height: currentSize.iconSize,
            animation: 'spin 1s linear infinite',
          }}
        />
      )}
      {children}
    </button>
  );
};

export const TableLoadingSkeleton: React.FC<{ rows?: number; columns?: number }> = ({ rows = 5,
  columns = 4, }) => (
  <div style={{ width: '100%' }}>
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div
        key={rowIndex}
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap: '1rem',
          padding: '1rem',
          borderBottom: '1px solid #e5e7eb',
        }}
      >
        {Array.from({ length: columns }).map((_, colIndex) => (
          <div
            key={colIndex}
            style={{
              height: '1.25rem',
              backgroundColor: '#f3f4f6',
              borderRadius: '0.25rem',
              animation: 'loadingPulse 2s cubic-bezier(0.455, 0.03, 0.515, 0.955) infinite',
              animationDelay: `${(rowIndex * columns + colIndex) * 0.05}s`,
            }}
          />
        ))}
      </div>
    ))}
  </div>
);

export const CardLoadingSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => (
  <div style={{ display: 'grid', gap: '1rem' }}>
    {Array.from({ length: count }).map((_, index) => (
      <div
        key={index}
        style={{ padding: '1.5rem',
          backgroundColor: 'white',
          borderRadius: '0.5rem',
          border: '1px solid #e5e7eb',
        }}
      >
        <div
          style={{ display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '1rem',
          }}
        >
          <div
            style={{ width: '3rem',
              height: '3rem',
              backgroundColor: '#f3f4f6',
              borderRadius: '50%',
              animation: 'loadingPulse 2s cubic-bezier(0.455, 0.03, 0.515, 0.955) infinite',
            }}
          />
          <div style={{ flex: 1 }}>
            <div
              style={{ height: '1rem',
                backgroundColor: '#f3f4f6',
                borderRadius: '0.25rem',
                marginBottom: '0.5rem',
                animation: 'loadingPulse 2s cubic-bezier(0.455, 0.03, 0.515, 0.955) infinite',
                animationDelay: '0.1s',
              }}
            />
            <div
              style={{ height: '0.75rem',
                backgroundColor: '#f3f4f6',
                borderRadius: '0.25rem',
                width: '60%',
                animation: 'loadingPulse 2s cubic-bezier(0.455, 0.03, 0.515, 0.955) infinite',
                animationDelay: '0.2s',
              }}
            />
          </div>
        </div>
        <div
          style={{ height: '4rem',
            backgroundColor: '#f3f4f6',
            borderRadius: '0.25rem',
            animation: 'loadingPulse 2s cubic-bezier(0.455, 0.03, 0.515, 0.955) infinite',
            animationDelay: '0.3s',
          }}
        />
      </div>
    ))}
  </div>
);

export default Loading;
