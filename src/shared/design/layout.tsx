/**
 * Advanced Layout Components
 * Modern layout primitives for responsive and flexible designs
 */

import React, { forwardRef } from 'react';
import type { ReactNode } from 'react';
import { designTokens, designUtils } from './tokens';

// Base layout props
interface BaseLayoutProps {
  className?: string;
  children?: ReactNode;
}

// Container component for max-width layouts
export interface ContainerProps extends BaseLayoutProps {
  maxWidth?: keyof typeof designTokens.layout.containerMaxWidth;
  padding?: boolean;
  center?: boolean;
}

export const Container = forwardRef<HTMLDivElement, ContainerProps>(
  ({ maxWidth = 'xl', padding = true, center = true, className, children, ...props }, ref) => {
    const maxWidthClass = `max-w-${maxWidth}`;
    const paddingClass = padding ? 'px-4 sm:px-6 lg:px-8' : '';
    const centerClass = center ? 'mx-auto' : '';
    
    const finalClassName = designUtils.buildClass(
      'w-full',
      maxWidthClass,
      paddingClass,
      centerClass,
      className
    );
    
    return (
      <div ref={ref} className={finalClassName} {...props}>
        {children}
      </div>
    );
  }
);

Container.displayName = 'Container';

// Flexible grid system
export interface GridProps extends BaseLayoutProps {
  cols?: number | 'auto';
  gap?: keyof typeof designTokens.spacing;
  responsive?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
    '2xl'?: number;
  };
  autoFit?: boolean;
  minChildWidth?: string;
}

export const Grid = forwardRef<HTMLDivElement, GridProps>(
  ({ 
    cols = 1, 
    gap = '4', 
    responsive,
    autoFit = false,
    minChildWidth = '250px',
    className, 
    children, 
    ...props 
  }, ref) => {
    let gridClass = '';
    
    if (autoFit) {
      gridClass = `grid-cols-[repeat(auto-fit,minmax(${minChildWidth},1fr))]`;
    } else if (cols === 'auto') {
      gridClass = 'grid-cols-auto';
    } else {
      gridClass = `grid-cols-${cols}`;
    }
    
    const gapClass = `gap-${gap}`;
    
    // Build responsive classes
    let responsiveClasses = '';
    if (responsive) {
      Object.entries(responsive).forEach(([breakpoint, colCount]) => {
        responsiveClasses += ` ${breakpoint}:grid-cols-${colCount}`;
      });
    }
    
    const finalClassName = designUtils.buildClass(
      'grid',
      gridClass,
      gapClass,
      responsiveClasses,
      className
    );
    
    return (
      <div ref={ref} className={finalClassName} {...props}>
        {children}
      </div>
    );
  }
);

Grid.displayName = 'Grid';

// Flexbox utilities
export interface FlexProps extends BaseLayoutProps {
  direction?: 'row' | 'col' | 'row-reverse' | 'col-reverse';
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  wrap?: boolean;
  gap?: keyof typeof designTokens.spacing;
  responsive?: {
    sm?: Partial<Pick<FlexProps, 'direction' | 'align' | 'justify'>>;
    md?: Partial<Pick<FlexProps, 'direction' | 'align' | 'justify'>>;
    lg?: Partial<Pick<FlexProps, 'direction' | 'align' | 'justify'>>;
    xl?: Partial<Pick<FlexProps, 'direction' | 'align' | 'justify'>>;
  };
}

export const Flex = forwardRef<HTMLDivElement, FlexProps>(
  ({ 
    direction = 'row',
    align = 'start',
    justify = 'start',
    wrap = false,
    gap = '0',
    responsive,
    className,
    children,
    ...props
  }, ref) => {
    const directionClass = `flex-${direction}`;
    const alignClass = `items-${align}`;
    const justifyClass = `justify-${justify}`;
    const wrapClass = wrap ? 'flex-wrap' : '';
    const gapClass = gap !== '0' ? `gap-${gap}` : '';
    
    // Build responsive classes
    let responsiveClasses = '';
    if (responsive) {
      Object.entries(responsive).forEach(([breakpoint, settings]) => {
        if (settings.direction) responsiveClasses += ` ${breakpoint}:flex-${settings.direction}`;
        if (settings.align) responsiveClasses += ` ${breakpoint}:items-${settings.align}`;
        if (settings.justify) responsiveClasses += ` ${breakpoint}:justify-${settings.justify}`;
      });
    }
    
    const finalClassName = designUtils.buildClass(
      'flex',
      directionClass,
      alignClass,
      justifyClass,
      wrapClass,
      gapClass,
      responsiveClasses,
      className
    );
    
    return (
      <div ref={ref} className={finalClassName} {...props}>
        {children}
      </div>
    );
  }
);

Flex.displayName = 'Flex';

// Stack component for vertical layouts
export interface StackProps extends BaseLayoutProps {
  spacing?: keyof typeof designTokens.spacing;
  align?: 'start' | 'center' | 'end' | 'stretch';
  divider?: ReactNode;
}

export const Stack = forwardRef<HTMLDivElement, StackProps>(
  ({ spacing = '4', align = 'stretch', divider, className, children, ...props }, ref) => {
    const alignClass = `items-${align}`;
    const spaceClass = `space-y-${spacing}`;
    
    const finalClassName = designUtils.buildClass(
      'flex flex-col',
      alignClass,
      !divider && spaceClass,
      className
    );
    
    const childrenArray = React.Children.toArray(children);
    
    return (
      <div ref={ref} className={finalClassName} {...props}>
        {divider ? (
          childrenArray.map((child, index) => (
            <React.Fragment key={index}>
              {child}
              {index < childrenArray.length - 1 && divider}
            </React.Fragment>
          ))
        ) : (
          children
        )}
      </div>
    );
  }
);

Stack.displayName = 'Stack';

// HStack component for horizontal layouts
export interface HStackProps extends BaseLayoutProps {
  spacing?: keyof typeof designTokens.spacing;
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  wrap?: boolean;
}

export const HStack = forwardRef<HTMLDivElement, HStackProps>(
  ({ 
    spacing = '4', 
    align = 'center', 
    justify = 'start',
    wrap = false,
    className, 
    children, 
    ...props 
  }, ref) => {
    const alignClass = `items-${align}`;
    const justifyClass = `justify-${justify}`;
    const spaceClass = `space-x-${spacing}`;
    const wrapClass = wrap ? 'flex-wrap' : '';
    
    const finalClassName = designUtils.buildClass(
      'flex',
      alignClass,
      justifyClass,
      spaceClass,
      wrapClass,
      className
    );
    
    return (
      <div ref={ref} className={finalClassName} {...props}>
        {children}
      </div>
    );
  }
);

HStack.displayName = 'HStack';

// Center component for centering content
export interface CenterProps extends BaseLayoutProps {
  minHeight?: string;
  inline?: boolean;
}

export const Center = forwardRef<HTMLDivElement, CenterProps>(
  ({ minHeight, inline = false, className, children, ...props }, ref) => {
    const baseClass = inline ? 'inline-flex' : 'flex';
    const centerClass = 'items-center justify-center';
    const heightClass = minHeight ? `min-h-[${minHeight}]` : '';
    
    const finalClassName = designUtils.buildClass(
      baseClass,
      centerClass,
      heightClass,
      className
    );
    
    return (
      <div ref={ref} className={finalClassName} {...props}>
        {children}
      </div>
    );
  }
);

Center.displayName = 'Center';

// Aspect Ratio component
export interface AspectRatioProps extends BaseLayoutProps {
  ratio?: keyof typeof designTokens.layout.aspectRatio | number;
  maxWidth?: string;
}

export const AspectRatio = forwardRef<HTMLDivElement, AspectRatioProps>(
  ({ ratio = 'video', maxWidth, className, children, ...props }, ref) => {
    let ratioClass = '';
    
    if (typeof ratio === 'string') {
      ratioClass = designTokens.layout.aspectRatio[ratio];
    } else {
      ratioClass = `aspect-[${ratio}]`;
    }
    
    const maxWidthClass = maxWidth ? `max-w-[${maxWidth}]` : '';
    
    const finalClassName = designUtils.buildClass(
      'relative w-full',
      ratioClass,
      maxWidthClass,
      className
    );
    
    return (
      <div ref={ref} className={finalClassName} {...props}>
        <div className="absolute inset-0">
          {children}
        </div>
      </div>
    );
  }
);

AspectRatio.displayName = 'AspectRatio';

// Spacer component for flexible spacing
export interface SpacerProps {
  className?: string;
}

export const Spacer = forwardRef<HTMLDivElement, SpacerProps>(
  ({ className, ...props }, ref) => {
    const finalClassName = designUtils.buildClass(
      'flex-1',
      className
    );
    
    return <div ref={ref} className={finalClassName} {...props} />;
  }
);

Spacer.displayName = 'Spacer';

// Divider component
export interface DividerProps extends BaseLayoutProps {
  orientation?: 'horizontal' | 'vertical';
  variant?: 'solid' | 'dashed' | 'dotted';
  thickness?: '1' | '2' | '4';
  color?: string;
  length?: string;
}

export const Divider = forwardRef<HTMLDivElement, DividerProps>(
  ({ 
    orientation = 'horizontal',
    variant = 'solid',
    thickness = '1',
    color = 'border-secondary-200',
    length,
    className,
    children,
    ...props
  }, ref) => {
    const isHorizontal = orientation === 'horizontal';
    
    const orientationClass = isHorizontal ? 'w-full' : 'h-full';
    const borderClass = isHorizontal 
      ? `border-t-${thickness}` 
      : `border-l-${thickness}`;
    
    const variantClass = variant === 'dashed' 
      ? 'border-dashed' 
      : variant === 'dotted' 
      ? 'border-dotted' 
      : 'border-solid';
    
    const lengthClass = length ? (isHorizontal ? `w-[${length}]` : `h-[${length}]`) : '';
    
    const finalClassName = designUtils.buildClass(
      orientationClass,
      borderClass,
      variantClass,
      color,
      lengthClass,
      className
    );
    
    if (children) {
      return (
        <div 
          ref={ref} 
          className={designUtils.buildClass(
            'relative flex',
            isHorizontal ? 'items-center' : 'flex-col justify-center',
            className
          )}
          {...props}
        >
          <div className={finalClassName} />
          <div className={`absolute ${isHorizontal ? 'left-1/2 transform -translate-x-1/2' : 'top-1/2 transform -translate-y-1/2'} bg-white px-2`}>
            {children}
          </div>
        </div>
      );
    }
    
    return <div ref={ref} className={finalClassName} {...props} />;
  }
);

Divider.displayName = 'Divider';

// Show/Hide component for responsive visibility
export interface ShowHideProps extends BaseLayoutProps {
  above?: keyof typeof designTokens.breakpoints;
  below?: keyof typeof designTokens.breakpoints;
  only?: keyof typeof designTokens.breakpoints;
}

export const Show = forwardRef<HTMLDivElement, ShowHideProps>(
  ({ above, below, only, className, children, ...props }, ref) => {
    let visibilityClass = '';
    
    if (only) {
      const breakpoint = only;
      if (breakpoint === 'sm') {
        visibilityClass = 'hidden sm:block md:hidden';
      } else if (breakpoint === 'md') {
        visibilityClass = 'hidden md:block lg:hidden';
      } else if (breakpoint === 'lg') {
        visibilityClass = 'hidden lg:block xl:hidden';
      } else if (breakpoint === 'xl') {
        visibilityClass = 'hidden xl:block 2xl:hidden';
      } else if (breakpoint === '2xl') {
        visibilityClass = 'hidden 2xl:block';
      }
    } else {
      if (above) {
        visibilityClass += ` hidden ${above}:block`;
      }
      if (below) {
        visibilityClass += ` ${below}:hidden`;
      }
    }
    
    const finalClassName = designUtils.buildClass(
      visibilityClass,
      className
    );
    
    return (
      <div ref={ref} className={finalClassName} {...props}>
        {children}
      </div>
    );
  }
);

Show.displayName = 'Show';

export const Hide = forwardRef<HTMLDivElement, ShowHideProps>(
  ({ above, below, only, className, children, ...props }, ref) => {
    let visibilityClass = '';
    
    if (only) {
      const breakpoint = only;
      if (breakpoint === 'sm') {
        visibilityClass = 'sm:hidden md:block';
      } else if (breakpoint === 'md') {
        visibilityClass = 'md:hidden lg:block';
      } else if (breakpoint === 'lg') {
        visibilityClass = 'lg:hidden xl:block';
      } else if (breakpoint === 'xl') {
        visibilityClass = 'xl:hidden 2xl:block';
      } else if (breakpoint === '2xl') {
        visibilityClass = '2xl:hidden';
      }
    } else {
      if (above) {
        visibilityClass += ` ${above}:hidden`;
      }
      if (below) {
        visibilityClass += ` hidden ${below}:block`;
      }
    }
    
    const finalClassName = designUtils.buildClass(
      visibilityClass,
      className
    );
    
    return (
      <div ref={ref} className={finalClassName} {...props}>
        {children}
      </div>
    );
  }
);

Hide.displayName = 'Hide';