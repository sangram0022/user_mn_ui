/**
 * Keyboard Shortcut Hook
 * Provides easy keyboard shortcut management
 *
 * @example
 * ```tsx
 * // Command palette shortcut
 * useKeyboardShortcut(['ctrl', 'k'], openCommandPalette);
 *
 * // Search shortcut
 * useKeyboardShortcut(['ctrl', 'f'], focusSearchBar);
 *
 * // Multiple key combo
 * useKeyboardShortcut(['ctrl', 'shift', 's'], saveAll);
 * ```
 */

import { useEffect } from 'react';

type ModifierKey = 'ctrl' | 'shift' | 'alt' | 'meta';
type KeyCombo = (ModifierKey | string)[];

interface UseKeyboardShortcutOptions {
  enabled?: boolean;
  preventDefault?: boolean;
  stopPropagation?: boolean;
}

/**
 * Register a keyboard shortcut handler
 * @param keys - Array of keys to listen for (e.g., ['ctrl', 'k'])
 * @param callback - Function to call when shortcut is triggered
 * @param options - Configuration options
 */
export const useKeyboardShortcut = (
  keys: KeyCombo,
  callback: (event: KeyboardEvent) => void,
  options: UseKeyboardShortcutOptions = {}
): void => {
  const { enabled = true, preventDefault = true, stopPropagation = false } = options;

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const pressed = keys.every((key) => {
        switch (key.toLowerCase()) {
          case 'ctrl':
            return e.ctrlKey || e.metaKey;
          case 'meta':
            return e.metaKey;
          case 'shift':
            return e.shiftKey;
          case 'alt':
            return e.altKey;
          default:
            return e.key.toLowerCase() === key.toLowerCase();
        }
      });

      if (pressed) {
        if (preventDefault) e.preventDefault();
        if (stopPropagation) e.stopPropagation();
        callback(e);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [keys, callback, enabled, preventDefault, stopPropagation]);
};

/**
 * Register multiple keyboard shortcuts at once
 * @param shortcuts - Array of shortcut configurations
 *
 * @example
 * ```tsx
 * useKeyboardShortcuts([
 *   { keys: ['ctrl', 'k'], callback: openCommandPalette },
 *   { keys: ['ctrl', 's'], callback: save },
 *   { keys: ['esc'], callback: closeModal },
 * ]);
 * ```
 */
export const useKeyboardShortcuts = (
  shortcuts: Array<{
    keys: KeyCombo;
    callback: (event: KeyboardEvent) => void;
    options?: UseKeyboardShortcutOptions;
  }>
): void => {
  shortcuts.forEach(({ keys, callback, options }) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useKeyboardShortcut(keys, callback, options);
  });
};

export default useKeyboardShortcut;
