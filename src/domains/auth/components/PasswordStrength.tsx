// ========================================
// PasswordStrength Component
// Visual indicator for password complexity
// ========================================

import { useMemo } from 'react';

interface PasswordStrengthProps {
  password: string;
  showLabel?: boolean;
}

interface StrengthResult {
  score: number; // 0-4
  label: 'Very Weak' | 'Weak' | 'Fair' | 'Strong' | 'Very Strong';
  color: string;
  percentage: number;
}

/**
 * Calculate password strength score
 */
function calculateStrength(password: string): StrengthResult {
  if (!password) {
    return {
      score: 0,
      label: 'Very Weak',
      color: 'bg-gray-300 dark:bg-gray-600',
      percentage: 0,
    };
  }

  let score = 0;
  
  // Length check (0-2 points)
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  
  // Character variety (0-4 points)
  if (/[a-z]/.test(password)) score += 1; // lowercase
  if (/[A-Z]/.test(password)) score += 1; // uppercase
  if (/[0-9]/.test(password)) score += 1; // numbers
  if (/[^a-zA-Z0-9]/.test(password)) score += 1; // special characters
  
  // Penalty for common patterns
  if (/^[a-zA-Z]+$/.test(password) || /^[0-9]+$/.test(password)) {
    score = Math.max(0, score - 1);
  }
  
  // Normalize to 0-4 scale
  const normalizedScore = Math.min(4, Math.max(0, Math.floor(score / 1.5)));
  
  // Map score to label and color
  const strengthMap: Record<number, { label: StrengthResult['label']; color: string }> = {
    0: { label: 'Very Weak', color: 'bg-red-500' },
    1: { label: 'Weak', color: 'bg-orange-500' },
    2: { label: 'Fair', color: 'bg-yellow-500' },
    3: { label: 'Strong', color: 'bg-blue-500' },
    4: { label: 'Very Strong', color: 'bg-green-500' },
  };
  
  const { label, color } = strengthMap[normalizedScore];
  
  return {
    score: normalizedScore,
    label,
    color,
    percentage: (normalizedScore / 4) * 100,
  };
}

/**
 * PasswordStrength Component
 * Shows visual feedback for password quality
 */
export function PasswordStrength({ password, showLabel = true }: PasswordStrengthProps) {
  // Kept: useMemo for expensive regex calculations on every keystroke (6 regex tests)
  const strength = useMemo(() => calculateStrength(password), [password]);
  
  if (!password) {
    return null;
  }
  
  return (
    <div className="space-y-2">
      {/* Strength Bar */}
      <div className="flex gap-1 h-2">
        {[...Array(4)].map((_, index) => (
          <div
            key={index}
            className={`flex-1 rounded-full transition-colors duration-300 ${
              index < strength.score
                ? strength.color
                : 'bg-gray-200 dark:bg-gray-700'
            }`}
          />
        ))}
      </div>
      
      {/* Strength Label */}
      {showLabel && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">
            Password strength:
          </span>
          <span
            className={`font-medium ${
              strength.score === 0
                ? 'text-red-600 dark:text-red-400'
                : strength.score === 1
                ? 'text-orange-600 dark:text-orange-400'
                : strength.score === 2
                ? 'text-yellow-600 dark:text-yellow-400'
                : strength.score === 3
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-green-600 dark:text-green-400'
            }`}
          >
            {strength.label}
          </span>
        </div>
      )}
      
      {/* Requirements Checklist */}
      <div className="mt-3 space-y-1 text-xs text-gray-600 dark:text-gray-400">
        <RequirementItem met={password.length >= 8} text="At least 8 characters" />
        <RequirementItem met={/[a-z]/.test(password)} text="Lowercase letter" />
        <RequirementItem met={/[A-Z]/.test(password)} text="Uppercase letter" />
        <RequirementItem met={/[0-9]/.test(password)} text="Number" />
        <RequirementItem met={/[^a-zA-Z0-9]/.test(password)} text="Special character" />
      </div>
    </div>
  );
}

/**
 * Individual requirement item
 */
function RequirementItem({ met, text }: { met: boolean; text: string }) {
  return (
    <div className="flex items-center gap-2">
      {met ? (
        <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
      ) : (
        <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clipRule="evenodd"
          />
        </svg>
      )}
      <span className={met ? 'text-green-600 dark:text-green-400' : ''}>
        {text}
      </span>
    </div>
  );
}

export default PasswordStrength;
