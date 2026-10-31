import React, { useState } from 'react';
import { User as UserIcon } from 'lucide-react';

// Developer-oriented modern vibrant palette
const AVATAR_PALETTE = [
  '#6366F1', // Indigo
  '#8B5CF6', // Violet
  '#EC4899', // Pink
  '#3B82F6', // Blue
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#06B6D4', // Cyan
  '#14B8A6', // Teal
  '#F97316', // Orange
  '#A855F7', // Purple
];

// Helper to get initials
export const getInitials = (name) => {
  if (!name || typeof name !== 'string') return 'U';
  const clean = name.trim();
  if (!clean) return 'U';

  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  // Single word: take first 2 letters if available (e.g. "AD" for "admin", "JD" for "johndoe")
  if (clean.length >= 2) {
    return clean.slice(0, 2).toUpperCase();
  }
  return clean[0].toUpperCase();
};

// Deterministic color from username
export const getAvatarColor = (name) => {
  if (!name || typeof name !== 'string') return AVATAR_PALETTE[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_PALETTE.length;
  return AVATAR_PALETTE[index];
};

const Avatar = ({
  src,
  name = 'User',
  size = 28,
  isGuest = false,
  style = {},
  className = '',
}) => {
  const [imgError, setImgError] = useState(false);

  const dimension = typeof size === 'number' ? `${size}px` : size;
  const isGuestUser =
    isGuest || (typeof name === 'string' && name.trim().toLowerCase() === 'guest');

  // Виключення для гостя: завжди показуємо дефолтну аватарку без літер
  if (isGuestUser) {
    if (imgError) {
      return (
        <div
          className={className}
          style={{
            width: dimension,
            height: dimension,
            minWidth: dimension,
            minHeight: dimension,
            borderRadius: '50%',
            backgroundColor: 'var(--bg-elevated, #334155)',
            color: 'var(--text-muted, #94a3b8)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid var(--border-color, #2e3c54)',
            flexShrink: 0,
            ...style,
          }}
          title="Guest"
          aria-label="Guest"
        >
          <UserIcon
            size={typeof size === 'number' ? Math.max(12, Math.floor(size * 0.55)) : 16}
          />
        </div>
      );
    }

    return (
      <img
        src="/uploads/default-avatar.png"
        alt="Guest"
        className={className}
        style={{
          width: dimension,
          height: dimension,
          minWidth: dimension,
          minHeight: dimension,
          borderRadius: '50%',
          objectFit: 'cover',
          flexShrink: 0,
          ...style,
        }}
        onError={() => setImgError(true)}
      />
    );
  }

  // Check if we have a real custom image (not default-avatar.png)
  const isDefaultImage = !src || src.includes('default-avatar.png');
  const showInitials = isDefaultImage || imgError;

  const initials = getInitials(name);
  const bgColor = getAvatarColor(name);

  const fontSize =
    typeof size === 'number' ? `${Math.max(10, Math.floor(size * 0.4))}px` : '0.8rem';

  if (showInitials) {
    return (
      <div
        className={className}
        style={{
          width: dimension,
          height: dimension,
          minWidth: dimension,
          minHeight: dimension,
          borderRadius: '50%',
          backgroundColor: bgColor,
          color: '#ffffff',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 700,
          fontFamily: 'var(--font-mono, monospace)',
          fontSize,
          letterSpacing: '0.02em',
          userSelect: 'none',
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
          flexShrink: 0,
          ...style,
        }}
        title={name}
        aria-label={name}
      >
        {initials}
      </div>
    );
  }

  const resolvedSrc =
    src.startsWith('/uploads') || src.startsWith('http') ? src : `/uploads/${src}`;

  return (
    <img
      src={resolvedSrc}
      alt={name}
      className={className}
      style={{
        width: dimension,
        height: dimension,
        minWidth: dimension,
        minHeight: dimension,
        borderRadius: '50%',
        objectFit: 'cover',
        flexShrink: 0,
        ...style,
      }}
      onError={() => setImgError(true)}
    />
  );
};

export default Avatar;

