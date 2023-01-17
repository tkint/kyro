import { Falsy } from '@/models/common';
import { memoize, notFalsy, notUndefined } from '@/utils/common';

export type Error = {
  reason: string;
};

export type Result<T, E> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      error: E;
    };

export const successOf = <T, E = never>(value: T): Result<T, E> => ({
  success: true,
  data: value,
});

export const failureOf = <E, T = never>(error: E): Result<T, E> => ({
  success: false,
  error,
});
