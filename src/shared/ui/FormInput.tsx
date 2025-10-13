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
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-gray-400" />
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
          className={`
            block w-full rounded-lg border border-gray-300 
            ${Icon ? 'pl-10' : 'pl-3'} 
            ${ToggleIcon ? 'pr-12' : 'pr-3'} 
            py-3 text-gray-900 text-sm
            shadow-sm transition-all duration-200
            focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none
            placeholder:text-gray-400
          `}
          placeholder={placeholder}
        />
        {ToggleIcon && onToggle && (
          <button
            type="button"
            onClick={onToggle}
            className="absolute inset-y-0 right-0 pr-3 flex items-center bg-transparent border-none cursor-pointer"
          >
            {ToggleIcon}
          </button>
        )}
      </div>
      {helperTextContent && <p className="mt-1 text-xs text-gray-600">{helperTextContent}</p>}
    </div>
  );
};
