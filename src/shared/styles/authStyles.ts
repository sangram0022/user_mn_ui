/**
 * Common auth form styles
 * Extracted from inline styles to reduce duplication and improve maintainability
 */

// Container styles
export const authContainer = {
  margin: '0 auto',
  width: '100%',
  maxWidth: '28rem',
};

export const authContainerWide = {
  margin: '0 auto',
  width: '100%',
  maxWidth: '48rem',
};

export const authCard = {
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(10px)',
  padding: '2rem 1.5rem',
  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  borderRadius: '1rem',
  border: '1px solid rgba(229, 231, 235, 0.5)',
};

export const authCardLarge = {
  ...authCard,
  padding: '2.5rem',
};

// Icon container styles
export const iconContainer = {
  margin: '0 auto 1.5rem',
  width: '4rem',
  height: '4rem',
  borderRadius: '1rem',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.4)',
};

export const iconContainerGradient = {
  ...iconContainer,
  background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
};

export const iconContainerSuccess = {
  ...iconContainer,
  backgroundColor: '#10b981',
  borderRadius: '9999px',
  boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.4)',
};

export const iconStyle = {
  width: '2rem',
  height: '2rem',
  color: 'white',
};

// Typography styles
export const heading = {
  fontSize: '1.875rem',
  fontWeight: 'bold',
  letterSpacing: '-0.025em',
  color: '#111827',
};

export const subheading = {
  marginTop: '0.5rem',
  fontSize: '0.875rem',
  color: '#6b7280',
};

export const sectionHeading = {
  fontSize: '0.75rem',
  fontWeight: '600',
  color: '#64748b',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.05em',
};

// Form styles
export const formContainer = {
  display: 'flex',
  flexDirection: 'column' as const,
  gap: '1.5rem',
};

export const formLabel = {
  display: 'block',
  fontSize: '0.875rem',
  fontWeight: '500',
  color: '#374151',
  marginBottom: '0.5rem',
};

export const inputWrapper = {
  position: 'relative' as const,
};

export const inputIconContainer = {
  position: 'absolute' as const,
  top: 0,
  bottom: 0,
  left: 0,
  paddingLeft: '0.75rem',
  display: 'flex',
  alignItems: 'center',
  pointerEvents: 'none' as const,
};

export const inputIconStyle = {
  height: '1.25rem',
  width: '1.25rem',
  color: '#9ca3af',
};

export const inputBase = {
  display: 'block',
  width: '100%',
  padding: '0.75rem',
  border: '1px solid #d1d5db',
  borderRadius: '0.5rem',
  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  color: '#111827',
  fontSize: '0.875rem',
  transition: 'all 0.2s ease',
  outline: 'none',
  boxSizing: 'border-box' as const,
};

export const inputWithIcon = {
  ...inputBase,
  paddingLeft: '2.5rem',
};

export const inputWithIconAndButton = {
  ...inputBase,
  paddingLeft: '2.5rem',
  paddingRight: '3rem',
};

export const inputFocusStyle = {
  borderColor: '#3b82f6',
  boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
};

export const inputBlurStyle = {
  borderColor: '#d1d5db',
  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
};

export const helperText = {
  marginTop: '0.25rem',
  fontSize: '0.75rem',
  color: '#6b7280',
};

export const requiredIndicator = {
  color: '#ef4444',
};

// Button styles
export const buttonBase = {
  width: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '0.5rem',
  padding: '0.75rem 1rem',
  border: 'none',
  borderRadius: '0.5rem',
  fontSize: '0.875rem',
  fontWeight: '500',
  transition: 'all 0.2s ease',
  cursor: 'pointer',
};

export const buttonPrimary = {
  ...buttonBase,
  color: '#ffffff',
  background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
};

export const buttonSecondary = {
  ...buttonBase,
  color: '#374151',
  backgroundColor: '#ffffff',
  border: '1px solid #d1d5db',
  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
};

export const buttonDisabled = {
  ...buttonBase,
  color: '#ffffff',
  background: '#9ca3af',
  cursor: 'not-allowed',
  opacity: 0.5,
};

export const toggleButton = {
  position: 'absolute' as const,
  top: 0,
  bottom: 0,
  right: 0,
  paddingRight: '0.75rem',
  display: 'flex',
  alignItems: 'center',
  backgroundColor: 'transparent',
  border: 'none',
  cursor: 'pointer',
};

// Link styles
export const linkPrimary = {
  fontSize: '0.875rem',
  fontWeight: 500,
  color: '#3b82f6',
  textDecoration: 'none',
  transition: 'color 0.2s ease',
};

export const linkSecondary = {
  fontSize: '0.875rem',
  color: '#6b7280',
  textDecoration: 'none',
  transition: 'color 0.2s ease',
};

// Section styles
export const infoSection = {
  marginTop: '2rem',
  backgroundColor: '#f8fafc',
  border: '1px solid #e2e8f0',
  borderRadius: '0.75rem',
  padding: '1.5rem',
};

export const card = {
  borderRadius: '0.5rem',
  border: '1px solid #e2e8f0',
  backgroundColor: '#ffffff',
  padding: '1rem',
  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
};

export const cardLarge = {
  ...card,
  borderRadius: '0.75rem',
};

// Layout utilities
export const centeredText = {
  textAlign: 'center' as const,
};

export const flexRow = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
};

export const flexColumn = {
  display: 'flex',
  flexDirection: 'column' as const,
  gap: '1rem',
};

export const spaceBetween = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '1rem',
  flexWrap: 'wrap' as const,
};
