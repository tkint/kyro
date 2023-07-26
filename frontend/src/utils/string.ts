import { memoize } from '@/utils/common';

export const memoUpperCase = memoize<string | undefined>((value) => value?.toUpperCase());

export const matchesOneOf = <T extends string & {}>(value: T, match: T, ...otherMatches: T[]) =>
  [match, ...otherMatches].includes(value);
