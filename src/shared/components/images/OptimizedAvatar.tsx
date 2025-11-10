import { ProgressiveImage } from './ProgressiveImage';
import type { OptimizedAvatarProps } from './utils/types';

// ========================================
// Optimized Avatar Component
// ========================================

export function OptimizedAvatar({
  src,
  name,
  size = 40,
  className = '',
}: OptimizedAvatarProps) {
  const initials = name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .slice(0, 2);

  const colors = [
    'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500',
    'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
  ];
  
  const colorIndex = name.charCodeAt(0) % colors.length;
  const bgColor = colors[colorIndex];

  if (!src) {
    return (
      <div
        className={`
          ${bgColor} text-white rounded-full flex items-center justify-center
          font-semibold ${className}
        `}
        style={{ width: size, height: size, fontSize: size * 0.4 }}
      >
        {initials}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <ProgressiveImage
        src={src}
        alt={`${name}'s avatar`}
        width={size}
        height={size}
        className="rounded-full"
        priority={size > 100} // Prioritize larger avatars
        placeholder="empty"
      />
      
      {/* Fallback initials (shown on error) */}
      <div
        className={`
          absolute inset-0 ${bgColor} text-white rounded-full 
          flex items-center justify-center font-semibold opacity-0
        `}
        style={{ fontSize: size * 0.4 }}
      >
        {initials}
      </div>
    </div>
  );
}
