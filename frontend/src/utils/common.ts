import { Falsy } from '@/models/common';
import { watch } from 'vue';

export const memoize = <TInput, TOutput = TInput>(fn: (value: TInput) => TOutput) => {
  const cache = Object.create(null);
  return (value: TInput) => {
    const hit = cache[value] as TOutput;
    return hit || (cache[value] = fn(value));
  };
};

export const notUndefined = <T>(value: T | undefined): value is T => {
  return value !== undefined;
};

export const notFalsy = <T>(value: T | Falsy): value is T => {
  return !!value;
};

export function waitUntil(fn: () => boolean): Promise<'success'>;
export function waitUntil(fn: () => boolean, timeout: number): Promise<'success' | 'timeout'>;
export function waitUntil(fn: () => boolean, timeout?: number): Promise<'success' | 'timeout'> {
  return new Promise((resolve) => {
    const timeoutId = timeout
      ? setTimeout(() => {
          stopWatch();
          resolve('timeout');
        }, timeout)
      : undefined;

    const stopWatch = watch(fn, (newValue) => {
      if (newValue) {
        resolve('success');
        stopWatch();
        clearTimeout(timeoutId);
      }
    });
  });
}
