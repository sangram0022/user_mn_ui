import React, { useState, type CSSProperties } from 'react';
import { LucideIcon } from 'lucide-react';

export interface FormInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'style'> {
  label: string;
  icon?: LucideIcon;
  error?: string;
  helperText?: string;
  containerStyle?: CSSProperties;
}

export const FormInput: React.FC<FormInputProps> = ({
  label,
  icon: Icon,
  error,
  helperText,
  required,
  containerStyle,
  ...inputProps
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const baseInputStyle: CSSProperties = {
    display: 'block',
    width: '100%',
    paddingLeft: Icon ? '2.5rem' : '0.75rem',
    paddingRight: '0.75rem',
    paddingTop: '0.75rem',
    paddingBottom: '0.75rem',
    border: error ? '1px solid #ef4444' : '1px solid #d1d5db',
    borderRadius: '0.5rem',
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    color: '#111827',
    fontSize: '0.875rem',
    transition: 'all 0.2s ease',
    outline: 'none',
    boxSizing: 'border-box',
    backgroundColor: '#ffffff',
  };

  const focusedStyle: CSSProperties = isFocused
    ? {
        borderColor: error ? '#ef4444' : '#3b82f6',
        boxShadow: error ? '0 0 0 3px rgba(239, 68, 68, 0.1)' : '0 0 0 3px rgba(59, 130, 246, 0.1)',
      }
    : {};

  return (
    <div style={containerStyle}>
      <label
        htmlFor={inputProps.id}
        style={{
          display: 'block',
          fontSize: '0.875rem',
          fontWeight: '500',
          color: '#374151',
          marginBottom: '0.5rem',
        }}
      >
        {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
      </label>
      <div style={{ position: 'relative' }}>
        {Icon && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: 0,
              paddingLeft: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              pointerEvents: 'none',
            }}
          >
            <Icon style={{ height: '1.25rem', width: '1.25rem', color: '#9ca3af' }} />
          </div>
        )}
        <input
          {...inputProps}
          style={{ ...baseInputStyle, ...focusedStyle }}
          onFocus={(e) => {
            setIsFocused(true);
            inputProps.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            inputProps.onBlur?.(e);
          }}
        />
      </div>
      {error && (
        <p style={{ marginTop: '0.25rem', fontSize: '0.75rem', color: '#ef4444' }}>{error}</p>
      )}
      {helperText && !error && (
        <p style={{ marginTop: '0.25rem', fontSize: '0.75rem', color: '#6b7280' }}>{helperText}</p>
      )}
    </div>
  );
};

export default FormInput;
