import { memoize } from '@/utils/common';

export const memoUpperCase = memoize<string | undefined>((value) => value?.toUpperCase());
