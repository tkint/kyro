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
