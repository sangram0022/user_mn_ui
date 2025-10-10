/**
 * Design System Export Index
 * Central export point for all design system components and utilities
 */

// Design tokens and utilities
export { designTokens, designUtils } from './tokens';

// Core components
export {
  Button,
  Input,
  Card,
  Alert,
  Badge,
  Modal,
  Spinner
} from './components';

export type {
  ButtonProps,
  InputProps,
  CardProps,
  AlertProps,
  BadgeProps,
  ModalProps,
  SpinnerProps
} from './components';

// Layout components
export {
  Container,
  Grid,
  Flex,
  Stack,
  HStack,
  Center,
  AspectRatio,
  Spacer,
  Divider,
  Show,
  Hide
} from './layout';

export type {
  ContainerProps,
  GridProps,
  FlexProps,
  StackProps,
  HStackProps,
  CenterProps,
  AspectRatioProps,
  SpacerProps,
  DividerProps,
  ShowHideProps
} from './layout';

// Form components
export {
  FormField,
  FormInput,
  Select,
  Textarea,
  Checkbox,
  RadioGroup,
  Toggle
} from './forms';

export type {
  FormFieldProps,
  FormInputProps,
  SelectProps,
  SelectOption,
  TextareaProps,
  CheckboxProps,
  RadioGroupProps,
  RadioOption,
  ToggleProps
} from './forms';

// Re-export commonly used design system utilities
import { designTokens, designUtils } from './tokens';

export const {
  colors,
  typography,
  spacing,
  borderRadius,
  boxShadow,
  animation,
  variants,
  sizes,
  breakpoints,
  zIndex,
  baseClasses,
  layout
} = designTokens;

// Utility functions for common design system operations
export const ds = {
  // Color utilities
  color: designUtils.getColor,
  
  // Class building utilities
  cn: designUtils.buildClass,
  clsx: designUtils.buildClass,
  
  // Responsive utilities
  responsive: designUtils.responsive,
  
  // Variant merging
  mergeVariants: designUtils.mergeVariants,
  
  // Common layout utilities
  center: 'flex items-center justify-center',
  stack: 'flex flex-col',
  hstack: 'flex items-center',
  
  // Common spacing utilities
  p: (size: string) => `p-${size}`,
  m: (size: string) => `m-${size}`,
  px: (size: string) => `px-${size}`,
  py: (size: string) => `py-${size}`,
  mt: (size: string) => `mt-${size}`,
  mb: (size: string) => `mb-${size}`,
  ml: (size: string) => `ml-${size}`,
  mr: (size: string) => `mr-${size}`,
  
  // Common size utilities
  w: (size: string) => `w-${size}`,
  h: (size: string) => `h-${size}`,
  size: (size: string) => `w-${size} h-${size}`,
  
  // Common border utilities
  rounded: (size: string = 'DEFAULT') => size === 'DEFAULT' ? 'rounded' : `rounded-${size}`,
  border: (side?: 't' | 'r' | 'b' | 'l') => side ? `border-${side}` : 'border',
  
  // Common shadow utilities
  shadow: (size: string = 'DEFAULT') => size === 'DEFAULT' ? 'shadow' : `shadow-${size}`,
  
  // Common text utilities
  text: {
    size: (size: string) => `text-${size}`,
    weight: (weight: string) => `font-${weight}`,
    color: (color: string) => `text-${color}`,
    center: 'text-center',
    left: 'text-left',
    right: 'text-right',
    justify: 'text-justify'
  },
  
  // Common background utilities
  bg: (color: string) => `bg-${color}`,
  
  // Animation utilities
  animate: (name: string) => `animate-${name}`,
  transition: 'transition-all duration-200 ease-in-out',
  
  // Focus utilities
  focus: 'focus:outline-none focus:ring-2 focus:ring-offset-2',
  focusRing: (color: string) => `focus:ring-${color}`,
  
  // Hover utilities
  hover: {
    bg: (color: string) => `hover:bg-${color}`,
    text: (color: string) => `hover:text-${color}`,
    opacity: (value: number) => `hover:opacity-${value}`,
    scale: (value: string) => `hover:scale-${value}`,
    shadow: (size: string) => `hover:shadow-${size}`
  },
  
  // State utilities
  disabled: 'disabled:opacity-50 disabled:cursor-not-allowed',
  loading: 'pointer-events-none opacity-50',
  
  // Layout utilities
  container: 'container mx-auto px-4',
  grid: (cols: number) => `grid grid-cols-${cols}`,
  gap: (size: string) => `gap-${size}`,
  flex: {
    center: 'flex items-center justify-center',
    between: 'flex items-center justify-between',
    start: 'flex items-center justify-start',
    end: 'flex items-center justify-end',
    col: 'flex flex-col',
    wrap: 'flex flex-wrap'
  }
};

// Component composition utilities
export const compose = {
  // Create a card with common styling
  card: (className?: string) => designUtils.buildClass(
    baseClasses.card,
    'p-6',
    className
  ),
  
  // Create a button with common styling
  button: (variant: keyof typeof variants.button = 'primary', className?: string) => designUtils.buildClass(
    baseClasses.button,
    variants.button[variant].base,
    sizes.button.md,
    'rounded-md',
    className
  ),
  
  // Create an input with common styling
  input: (className?: string) => designUtils.buildClass(
    baseClasses.input,
    variants.input.default.base,
    sizes.input.md,
    className
  ),
  
  // Create a modal overlay
  overlay: (className?: string) => designUtils.buildClass(
    'fixed inset-0 bg-black bg-opacity-50 z-modal',
    className
  ),
  
  // Create a dropdown menu
  dropdown: (className?: string) => designUtils.buildClass(
    baseClasses.dropdown,
    'py-1',
    className
  )
};

// Export everything as a single design system object
export const designSystem = {
  tokens: designTokens,
  utils: designUtils,
  ds,
  compose
};

export default designSystem;