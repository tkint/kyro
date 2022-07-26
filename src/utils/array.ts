import { Falsy } from '@/models/common';
import { memoize, notFalsy, notUndefined } from '@/utils/common';

export const arrayOfNotUndefined = <TItem>(...values: (TItem | undefined)[]): TItem[] => {
  return values.filter(notUndefined);
};

export const arrayOfNotFalsy = <TItem>(...values: (TItem | Falsy)[]) => {
  return values.filter(notFalsy);
};

export const sumOfValues = (array: number[]): number => array.reduce((total, value) => total + value, 0);

export const distinct = <TItem>(array: TItem[], transform: (item: TItem) => any = (item) => item) => {
  const uniqueItems: TItem[] = [];
  const transformedItems: any[] = [];

  array.forEach((item) => {
    const transformedItem = transform(item);

    if (!transformedItems.includes(transformedItem)) {
      uniqueItems.push(item);
      transformedItems.push(transformedItem);
    }
  });

  return uniqueItems;
};
