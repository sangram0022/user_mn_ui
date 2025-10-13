import {
  formLabel,
  helperText,
  inputBase,
  inputBlurStyle,
  inputFocusStyle,
  inputIconContainer,
  inputIconStyle,
  inputWithIcon,
  inputWithIconAndButton,
  inputWrapper,
  requiredIndicator,
  toggleButton,
} from '@shared/styles/authStyles';
import type { LucideIcon } from 'lucide-react';
import React from 'react';

interface FormInputProps {
  id: string;
  name: string;
  type: string;
  label: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  placeholder?: string;
  autoComplete?: string;
  Icon?: LucideIcon;
  helperTextContent?: string;
  ToggleIcon?: React.ReactNode;
  onToggle?: () => void;
}

export const FormInput: React.FC<FormInputProps> = ({
  id,
  name,
  type,
  label,
  value,
  onChange,
  required = false,
  placeholder,
  autoComplete,
  Icon,
  helperTextContent,
  ToggleIcon,
  onToggle,
}) => {
  const [isFocused, setIsFocused] = React.useState(false);

  const getInputStyle = () => {
    if (Icon && ToggleIcon) return inputWithIconAndButton;
    if (Icon) return inputWithIcon;
    return inputBase;
  };

  return (
    <div>
      <label htmlFor={id} style={formLabel}>
        {label} {required && <span style={requiredIndicator}>*</span>}
      </label>
      <div style={inputWrapper}>
        {Icon && (
          <div style={inputIconContainer}>
            <Icon style={inputIconStyle} />
          </div>
        )}
        <input
          id={id}
          name={name}
          type={type}
          autoComplete={autoComplete}
          required={required}
          value={value}
          onChange={onChange}
          style={{
            ...getInputStyle(),
            ...(isFocused ? inputFocusStyle : inputBlurStyle),
          }}
          placeholder={placeholder}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        {ToggleIcon && onToggle && (
          <button type="button" onClick={onToggle} style={toggleButton}>
            {ToggleIcon}
          </button>
        )}
      </div>
      {helperTextContent && <p style={helperText}>{helperTextContent}</p>}
    </div>
  );
};
