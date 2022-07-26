import dayjs, { ConfigType } from 'dayjs';
import { date } from 'zod';
import { memoize } from '@/utils/common';

export const formatDate = (date: ConfigType, format: string = 'DD/MM/YYYY'): string | undefined => {
  if (date === undefined || date === null) return undefined;
  return dayjs(date).format(format);
};
