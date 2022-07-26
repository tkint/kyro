import { Falsy } from '@/models/common';

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

export const range = (start: number, end?: number) => {
  return end !== undefined && end >= start
    ? [...Array(end - start + 1).keys()].map((i) => i + start)
    : [...Array(start).keys()];
};

export const compare = (a: string | number | Date, b: string | number | Date) => {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
};
