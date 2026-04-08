import React from 'react';

/**
 * Maps emoji characters to their unified code used in emoji-datasource-apple
 * Covers all emojis used in 123GO! — catalog icons, UI and in-game items
 */
const EMOJI_MAP: Record<string, string> = {
  // Game catalog icons
  '🐛': '1f41b',
  '🧩': '1f9e9',
  '🔭': '1f52d',
  '🍬': '1f36c',
  '🐸': '1f438',
  '🌈': '1f308',
  '🚂': '1f682',
  '🍕': '1f355',
  '⭐': '2b50',
  '🎨': '1f3a8',
  '🌸': '1f338',
  '🚀': '1f680',
  '🤖': '1f916',
  '🐾': '1f43e',
  '🏰': '1f3f0',
  '☀️': '2600-fe0f',
  '📅': '1f4c5',
  '⏰': '23f0',
  '🍦': '1f366',
  '🎯': '1f3af',
  // UI icons
  '🎮': '1f3ae',
  '🎉': '1f389',
  '🏆': '1f3c6',
  // In-game items
  '🍭': '1f36d',
  '🌿': '1f33f',
  '🚃': '1f683',
  '✨': '2728',
  '💫': '1f4ab',
  '🌟': '1f31f',
  '🌹': '1f339',
  '🌼': '1f33c',
  '🌺': '1f33a',
  '🌻': '1f33b',
  '🍎': '1f34e',
  '🍊': '1f34a',
  '🍋': '1f34b',
  '🍇': '1f347',
  '🍓': '1f353',
  '🫐': '1fad0',
  '👟': '1f45f',
  '🪐': '1fa90',
  '🌙': '1f319',
  '🌍': '1f30d',
  '🏠': '1f3e0',
  '📚': '1f4da',
  '🎵': '1f3b5',
  '🍌': '1f34c',
  '🐇': '1f407',
  '🍄': '1f344',
  '🐜': '1f41c',
  '🐞': '1f41e',
  '🐌': '1f40c',
  '🐦': '1f426',
  '🐝': '1f41d',
  '🎄': '1f384',
  '❤️': '2764-fe0f',
  '🍽️': '1f37d-fe0f',
  '📺': '1f4fa',
  '😴': '1f634',
  // ZooTabelas animals
  '🦁': '1f981',
  '🐘': '1f418',
  '🦒': '1f992',
  '🦓': '1f993',
  '🐒': '1f412',
  // CalendarioVivo
  '✏️': '270f-fe0f',
  '⚽': '26bd',
  '🎈': '1f388',
  // SorveteriaDados
  '🍫': '1f36b',
  // MaquinaTempo
  '⚙️': '2699-fe0f',
  // AtelieOrdem extras
  '💙': '1f499',
  '🐋': '1f40b',
  '📦': '1f4e6',
  '🎁': '1f381',
  '📱': '1f4f1',
  '🎱': '1f3b1',
  '⛰️': '26f0-fe0f',
  '🐕': '1f415',
  '🐱': '1f431',
  '🐄': '1f404',
  '🟥': '1f7e5',
  '🔴': '1f534',
  '🔵': '1f535',
  '🏔️': '1f3d4-fe0f',
  '🐟': '1f41f',
  '🐠': '1f420',
  '🦈': '1f988',
  '🐆': '1f406',
  '🦊': '1f98a',
  '🦅': '1f985',
  '🦋': '1f98b',
  // NaveOrganizadora
  '👽': '1f47d',
  '🟢': '1f7e2',
  '👻': '1f47b',
  '🟡': '1f7e1',
  // CasteloPosicoes
  '👑': '1f451',
  '🗡️': '1f5e1-fe0f',
  // SolLuaEstrelas / CalendarioVivo extras
  '🌅': '1f305',
  '🏫': '1f3eb',
  '☕': '2615',
  '🍳': '1f373',
  '🎒': '1f392',
  // PizzariaMagica extras
  '🥪': '1f96a',
  '🎂': '1f382',
  '🏪': '1f3ea',
  // ParOuImpar extras
  '🍰': '1f370',
  '🧦': '1f9e6',
  '🧤': '1f9e4',
};

/**
 * Returns the public path for an Apple emoji PNG.
 * Files are served from /public/emoji/ (base-URL-aware).
 */
export function getAppleEmojiUrl(emoji: string): string | null {
  const code = EMOJI_MAP[emoji];
  if (!code) return null;
  return `${import.meta.env.BASE_URL}emoji/${code}.png`;
}

interface AppleEmojiProps {
  /** The emoji character, e.g. '🐛' */
  emoji: string;
  /** Rendered size in px (default 64) */
  size?: number;
  /** Extra CSS class names */
  className?: string;
  /** Inline style overrides */
  style?: React.CSSProperties;
  /** Accessible label (defaults to the emoji char) */
  alt?: string;
}

/**
 * Renders an emoji using the official Apple 3D PNG image (same as WhatsApp on iPhone).
 * Falls back to a plain <span> if the image is not in the map or fails to load.
 */
export function AppleEmoji({ emoji, size = 64, className = '', style, alt }: AppleEmojiProps) {
  const url = getAppleEmojiUrl(emoji);

  if (!url) {
    return (
      <span
        role="img"
        aria-label={alt ?? emoji}
        className={className}
        style={{ fontSize: size, lineHeight: 1, display: 'inline-block', ...style }}
      >
        {emoji}
      </span>
    );
  }

  return (
    <img
      src={url}
      alt={alt ?? emoji}
      width={size}
      height={size}
      role="img"
      className={`apple-emoji ${className}`}
      style={{
        width: size,
        height: size,
        objectFit: 'contain',
        display: 'inline-block',
        verticalAlign: 'middle',
        userSelect: 'none',
        WebkitUserDrag: 'none' as React.CSSProperties['WebkitUserDrag'],
        pointerEvents: 'none',
        ...style,
      }}
      onError={(e) => {
        // Graceful fallback to unicode emoji on load error
        const img = e.currentTarget;
        const span = document.createElement('span');
        span.textContent = emoji;
        span.style.fontSize = size + 'px';
        span.setAttribute('role', 'img');
        span.setAttribute('aria-label', alt ?? emoji);
        img.parentNode?.insertBefore(span, img);
        img.style.display = 'none';
      }}
    />
  );
}
