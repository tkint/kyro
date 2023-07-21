import { Falsy } from '@/models/common';
import { notFalsy, notUndefined } from '@/utils/common';

export const arrayOfNotUndefined = <TItem>(...values: (TItem | undefined)[]): TItem[] => {
  return values.filter(notUndefined);
};

export const arrayOfNotFalsy = <TItem>(...values: (TItem | Falsy)[]) => {
  return values.filter(notFalsy);
};
