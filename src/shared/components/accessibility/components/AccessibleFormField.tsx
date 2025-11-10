/**
 * AccessibleFormField Component
 * Form field wrapper with proper labels, help text, and error handling
 */

interface AccessibleFormFieldProps {
  id: string;
  label: string;
  error?: string;
  helpText?: string;
  required?: boolean;
  children: React.ReactNode;
}

export function AccessibleFormField({
  id,
  label,
  error,
  helpText,
  required,
  children,
}: AccessibleFormFieldProps) {
  const helpId = helpText ? `${id}-help` : undefined;
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className="mb-4">
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label}
        {required && (
          <span className="text-red-500 ml-1" aria-label="required">*</span>
        )}
      </label>
      
      <div>
        {children}
      </div>
      
      {helpText && (
        <p id={helpId} className="mt-1 text-sm text-gray-500">
          {helpText}
        </p>
      )}
      
      {error && (
        <p
          id={errorId}
          className="mt-1 text-sm text-red-600"
          role="alert"
          aria-live="polite"
        >
          <span className="sr-only">Error: </span>
          {error}
        </p>
      )}
    </div>
  );
}

export type { AccessibleFormFieldProps };
