import dayjs, { ConfigType, Dayjs } from 'dayjs';

export const fromEpoch = (epoch: number): Dayjs => dayjs(epoch / 1000000);

export const formatDate = (date: ConfigType, format: string = 'DD/MM/YYYY'): string | undefined => {
  if (date === undefined || date === null) return undefined;
  return dayjs(date).format(format);
};
