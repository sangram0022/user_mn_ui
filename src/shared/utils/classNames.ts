/**
 * Class name utility for merging conditional classes
 * A lightweight alternative to classnames/clsx
 */

type ClassValue = ClassArray | ClassDictionary | string | number | null | boolean | undefined;

type ClassDictionary = Record<string, boolean | null | undefined>;
type ClassArray = ClassValue[];

function toVal(mix: ClassValue): string {
  let str = '';

  if (typeof mix === 'string' || typeof mix === 'number') {
    str += mix;
  } else if (typeof mix === 'object' && mix !== null) {
    if (Array.isArray(mix)) {
      for (let y = 0; y < mix.length; y++) {
        if (mix[y]) {
          const val = toVal(mix[y]);
          if (val) {
            if (str) str += ' ';
            str += val;
          }
        }
      }
    } else {
      for (const y in mix) {
        if (mix[y]) {
          if (str) str += ' ';
          str += y;
        }
      }
    }
  }

  return str;
}

/**
 * Merges class names conditionally
 * @param inputs - Various class inputs (strings, objects, arrays)
 * @returns Merged class string
 */
export function cn(...inputs: ClassValue[]): string {
  let str = '';

  for (let i = 0; i < inputs.length; i++) {
    const tmp = inputs[i];
    if (tmp) {
      const x = toVal(tmp);
      if (x) {
        if (str) str += ' ';
        str += x;
      }
    }
  }

  return str;
}

/**
 * Alternative export for those who prefer clsx naming
 */
export const clsx = cn;
