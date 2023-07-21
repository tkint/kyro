export type Error = {
  reason: string;
};

type Success<T> = {
  success: true;
  data: T;
};

type Failure<E> = {
  success: false;
  error: E;
};

export type Result<T, E> = Success<T> | Failure<E>;

export const successOf = <T, E = never>(value: T): Result<T, E> => ({
  success: true,
  data: value,
});

export const failureOf = <E, T = never>(error: E): Result<T, E> => ({
  success: false,
  error,
});

export const onSuccess = async <T, U, E = never>(
  result: Result<T, E>,
  other: (data: T) => Promise<Result<U, E>>,
): Promise<Result<[T, U], E>> => {
  if (result.success) {
    const otherResult = await other(result.data);

    if (otherResult.success) {
      return successOf([result.data, otherResult.data]);
    }
    return otherResult;
  }
  return result;
};

export const flatOnSuccess = <T, U, E = never>(result: Result<T, E>, other: (data: T) => U): Result<U, E> => {
  if (result.success) {
    return successOf(other(result.data));
  }
  return result;
};
