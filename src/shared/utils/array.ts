/**
 * Array Utility Functions
 *
 * Common array manipulation utilities to reduce code duplication
 * and provide consistent array operations across the application.
 *
 * @module arrayUtils
 */

/**
 * Removes duplicate values from an array
 *
 * @param arr - Array to process
 * @param key - Optional key to check uniqueness on (for objects)
 * @returns Array with unique values
 *
 * @example
 * unique([1, 2, 2, 3, 3, 3]) // [1, 2, 3]
 * unique([{id: 1}, {id: 2}, {id: 1}], 'id') // [{id: 1}, {id: 2}]
 */
export function unique<T>(arr: T[], key?: keyof T): T[] {
  if (!arr || arr.length === 0) return [];

  if (key) {
    const seen = new Set();
    return arr.filter((item) => {
      const value = item[key];
      if (seen.has(value)) return false;
      seen.add(value);
      return true;
    });
  }

  return [...new Set(arr)];
}

/**
 * Groups array items by a key
 *
 * @param arr - Array to group
 * @param key - Key to group by (or function that returns key)
 * @returns Object with grouped items
 *
 * @example
 * groupBy([{type: 'a', val: 1}, {type: 'b', val: 2}, {type: 'a', val: 3}], 'type')
 * // { a: [{type: 'a', val: 1}, {type: 'a', val: 3}], b: [{type: 'b', val: 2}] }
 */
export function groupBy<T>(
  arr: T[],
  key: keyof T | ((item: T) => string | number)
): Record<string, T[]> {
  if (!arr || arr.length === 0) return {};

  return arr.reduce(
    (groups, item) => {
      const groupKey = typeof key === 'function' ? key(item) : String(item[key]);

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }

      groups[groupKey].push(item);
      return groups;
    },
    {} as Record<string, T[]>
  );
}

/**
 * Sorts array by a key or comparator function
 *
 * @param arr - Array to sort
 * @param key - Key to sort by or comparator function
 * @param order - Sort order (default: 'asc')
 * @returns Sorted array (new array)
 *
 * @example
 * sortBy([{age: 30}, {age: 20}], 'age') // [{age: 20}, {age: 30}]
 * sortBy([{age: 30}, {age: 20}], 'age', 'desc') // [{age: 30}, {age: 20}]
 */
export function sortBy<T>(
  arr: T[],
  key: keyof T | ((a: T, b: T) => number),
  order: 'asc' | 'desc' = 'asc'
): T[] {
  if (!arr || arr.length === 0) return [];

  const sorted = [...arr].sort((a, b) => {
    if (typeof key === 'function') {
      return key(a, b);
    }

    const aVal = a[key];
    const bVal = b[key];

    if (aVal < bVal) return order === 'asc' ? -1 : 1;
    if (aVal > bVal) return order === 'asc' ? 1 : -1;
    return 0;
  });

  return sorted;
}

/**
 * Chunks array into smaller arrays of specified size
 *
 * @param arr - Array to chunk
 * @param size - Size of each chunk
 * @returns Array of chunks
 *
 * @example
 * chunk([1, 2, 3, 4, 5], 2) // [[1, 2], [3, 4], [5]]
 */
export function chunk<T>(arr: T[], size: number): T[][] {
  if (!arr || arr.length === 0 || size <= 0) return [];

  const chunks: T[][] = [];

  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }

  return chunks;
}

/**
 * Flattens nested arrays
 *
 * @param arr - Array to flatten
 * @param depth - Depth to flatten (default: 1)
 * @returns Flattened array
 *
 * @example
 * flatten([[1, 2], [3, 4]]) // [1, 2, 3, 4]
 * flatten([[1, [2]], [3, [4]]], 2) // [1, 2, 3, 4]
 */
export function flatten<T>(arr: unknown[], depth = 1): T[] {
  if (!arr || arr.length === 0) return [];

  if (depth === 1) {
    return arr.flat() as T[];
  }

  return arr.flat(depth) as T[];
}

/**
 * Returns intersection of two arrays
 *
 * @param arr1 - First array
 * @param arr2 - Second array
 * @param key - Optional key for object comparison
 * @returns Array of common elements
 *
 * @example
 * intersection([1, 2, 3], [2, 3, 4]) // [2, 3]
 * intersection([{id: 1}, {id: 2}], [{id: 2}, {id: 3}], 'id') // [{id: 2}]
 */
export function intersection<T>(arr1: T[], arr2: T[], key?: keyof T): T[] {
  if (!arr1 || !arr2 || arr1.length === 0 || arr2.length === 0) return [];

  if (key) {
    const set2 = new Set(arr2.map((item) => item[key]));
    return arr1.filter((item) => set2.has(item[key]));
  }

  const set2 = new Set(arr2);
  return arr1.filter((item) => set2.has(item));
}

/**
 * Returns difference between two arrays (items in arr1 not in arr2)
 *
 * @param arr1 - First array
 * @param arr2 - Second array
 * @param key - Optional key for object comparison
 * @returns Array of different elements
 *
 * @example
 * difference([1, 2, 3], [2, 3, 4]) // [1]
 * difference([{id: 1}, {id: 2}], [{id: 2}], 'id') // [{id: 1}]
 */
export function difference<T>(arr1: T[], arr2: T[], key?: keyof T): T[] {
  if (!arr1 || arr1.length === 0) return [];
  if (!arr2 || arr2.length === 0) return arr1;

  if (key) {
    const set2 = new Set(arr2.map((item) => item[key]));
    return arr1.filter((item) => !set2.has(item[key]));
  }

  const set2 = new Set(arr2);
  return arr1.filter((item) => !set2.has(item));
}

/**
 * Shuffles array randomly
 *
 * @param arr - Array to shuffle
 * @returns Shuffled array (new array)
 *
 * @example
 * shuffle([1, 2, 3, 4, 5]) // [3, 1, 5, 2, 4] (random)
 */
export function shuffle<T>(arr: T[]): T[] {
  if (!arr || arr.length === 0) return [];

  const shuffled = [...arr];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}

/**
 * Returns random item from array
 *
 * @param arr - Array to pick from
 * @returns Random item
 *
 * @example
 * sample([1, 2, 3, 4, 5]) // 3 (random)
 */
export function sample<T>(arr: T[]): T | undefined {
  if (!arr || arr.length === 0) return undefined;
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Returns n random items from array
 *
 * @param arr - Array to pick from
 * @param n - Number of items to pick
 * @returns Array of random items
 *
 * @example
 * sampleSize([1, 2, 3, 4, 5], 3) // [2, 4, 1] (random)
 */
export function sampleSize<T>(arr: T[], n: number): T[] {
  if (!arr || arr.length === 0 || n <= 0) return [];

  const shuffled = shuffle(arr);
  return shuffled.slice(0, Math.min(n, arr.length));
}

/**
 * Partitions array into two arrays based on predicate
 *
 * @param arr - Array to partition
 * @param predicate - Function to test each element
 * @returns Tuple of [matches, non-matches]
 *
 * @example
 * partition([1, 2, 3, 4, 5], x => x % 2 === 0) // [[2, 4], [1, 3, 5]]
 */
export function partition<T>(arr: T[], predicate: (item: T) => boolean): [T[], T[]] {
  if (!arr || arr.length === 0) return [[], []];

  const matches: T[] = [];
  const nonMatches: T[] = [];

  arr.forEach((item) => {
    if (predicate(item)) {
      matches.push(item);
    } else {
      nonMatches.push(item);
    }
  });

  return [matches, nonMatches];
}

/**
 * Counts occurrences of each value in array
 *
 * @param arr - Array to count
 * @param key - Optional key to count by (for objects)
 * @returns Object with counts
 *
 * @example
 * countBy([1, 2, 2, 3, 3, 3]) // { '1': 1, '2': 2, '3': 3 }
 * countBy([{type: 'a'}, {type: 'b'}, {type: 'a'}], 'type') // { a: 2, b: 1 }
 */
export function countBy<T>(
  arr: T[],
  key?: keyof T | ((item: T) => string | number)
): Record<string, number> {
  if (!arr || arr.length === 0) return {};

  return arr.reduce(
    (counts, item) => {
      const countKey =
        typeof key === 'function' ? String(key(item)) : key ? String(item[key]) : String(item);

      counts[countKey] = (counts[countKey] || 0) + 1;
      return counts;
    },
    {} as Record<string, number>
  );
}

/**
 * Returns first n items from array
 *
 * @param arr - Array to take from
 * @param n - Number of items (default: 1)
 * @returns First n items
 *
 * @example
 * take([1, 2, 3, 4, 5], 3) // [1, 2, 3]
 */
export function take<T>(arr: T[], n = 1): T[] {
  if (!arr || arr.length === 0 || n <= 0) return [];
  return arr.slice(0, n);
}

/**
 * Returns last n items from array
 *
 * @param arr - Array to take from
 * @param n - Number of items (default: 1)
 * @returns Last n items
 *
 * @example
 * takeLast([1, 2, 3, 4, 5], 3) // [3, 4, 5]
 */
export function takeLast<T>(arr: T[], n = 1): T[] {
  if (!arr || arr.length === 0 || n <= 0) return [];
  return arr.slice(-n);
}

/**
 * Removes falsy values from array
 *
 * @param arr - Array to compact
 * @returns Array without falsy values
 *
 * @example
 * compact([0, 1, false, 2, '', 3, null, undefined, 4]) // [1, 2, 3, 4]
 */
export function compact<T>(arr: (T | null | undefined | false | 0 | '')[]): T[] {
  if (!arr || arr.length === 0) return [];
  return arr.filter(Boolean) as T[];
}

/**
 * Creates an array of numbers in a range
 *
 * @param start - Start of range
 * @param end - End of range (exclusive)
 * @param step - Step size (default: 1)
 * @returns Array of numbers
 *
 * @example
 * range(1, 5) // [1, 2, 3, 4]
 * range(0, 10, 2) // [0, 2, 4, 6, 8]
 * range(5, 1, -1) // [5, 4, 3, 2]
 */
export function range(start: number, end: number, step = 1): number[] {
  if (step === 0) return [];

  const result: number[] = [];
  const isIncreasing = step > 0;

  for (let i = start; isIncreasing ? i < end : i > end; i += step) {
    result.push(i);
  }

  return result;
}

/**
 * Finds the sum of array values
 *
 * @param arr - Array of numbers
 * @param key - Optional key to sum by (for objects)
 * @returns Sum of values
 *
 * @example
 * sum([1, 2, 3, 4, 5]) // 15
 * sum([{val: 1}, {val: 2}, {val: 3}], 'val') // 6
 */
export function sum<T>(arr: T[], key?: keyof T): number {
  if (!arr || arr.length === 0) return 0;

  if (key) {
    return arr.reduce((total, item) => {
      const value = Number(item[key]);
      return total + (Number.isNaN(value) ? 0 : value);
    }, 0);
  }

  return arr.reduce((total, item) => {
    const value = Number(item);
    return total + (Number.isNaN(value) ? 0 : value);
  }, 0);
}

/**
 * Finds the average of array values
 *
 * @param arr - Array of numbers
 * @param key - Optional key to average by (for objects)
 * @returns Average of values
 *
 * @example
 * average([1, 2, 3, 4, 5]) // 3
 * average([{val: 10}, {val: 20}, {val: 30}], 'val') // 20
 */
export function average<T>(arr: T[], key?: keyof T): number {
  if (!arr || arr.length === 0) return 0;
  return sum(arr, key) / arr.length;
}

/**
 * Finds the minimum value in array
 *
 * @param arr - Array of numbers
 * @param key - Optional key to find min by (for objects)
 * @returns Minimum value or item
 *
 * @example
 * min([5, 2, 8, 1, 9]) // 1
 * min([{val: 5}, {val: 2}, {val: 8}], 'val') // {val: 2}
 */
export function min<T>(arr: T[], key?: keyof T): T | undefined {
  if (!arr || arr.length === 0) return undefined;

  if (key) {
    return arr.reduce((minItem, item) =>
      Number(item[key]) < Number(minItem[key]) ? item : minItem
    );
  }

  return arr.reduce((minVal, val) => (Number(val) < Number(minVal) ? val : minVal));
}

/**
 * Finds the maximum value in array
 *
 * @param arr - Array of numbers
 * @param key - Optional key to find max by (for objects)
 * @returns Maximum value or item
 *
 * @example
 * max([5, 2, 8, 1, 9]) // 9
 * max([{val: 5}, {val: 2}, {val: 8}], 'val') // {val: 8}
 */
export function max<T>(arr: T[], key?: keyof T): T | undefined {
  if (!arr || arr.length === 0) return undefined;

  if (key) {
    return arr.reduce((maxItem, item) =>
      Number(item[key]) > Number(maxItem[key]) ? item : maxItem
    );
  }

  return arr.reduce((maxVal, val) => (Number(val) > Number(maxVal) ? val : maxVal));
}
