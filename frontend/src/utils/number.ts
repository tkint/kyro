export const percentage = (top: number, bottom: number) => (bottom ? (top / bottom) * 100.0 : 0);

export enum MemoryUnit {
  B = 'B',
  KB = 'KB',
  MB = 'MB',
  GB = 'GB',
  TB = 'TB',
}

export const convertMemory = (value: number, fromUnit: MemoryUnit): Record<MemoryUnit, number> => {
  const units = Object.keys(MemoryUnit);
  const unitIndex = units.indexOf(fromUnit);

  return Object.fromEntries(
    units.map((unit, index) => {
      const diff = Math.abs(index - unitIndex);

      if (index < unitIndex) {
        return [unit, value * Math.pow(1000, diff)];
      }

      if (index > unitIndex) {
        return [unit, value / Math.pow(1000, diff)];
      }

      return [unit, value];
    }),
  ) as Record<MemoryUnit, number>;

  let B: number;

  switch (fromUnit) {
    case 'B':
      B = value;
      break;
    case 'KB':
      B = value * 1000;
      break;
    case 'MB':
      B = value * 1000000;
      break;
    case 'GB':
      B = value * 1000000000;
      break;
    case 'TB':
      B = value * 1000000000000;
      break;
  }

  const KB = B / 1000;
  const MB = KB / 1000;
  const GB = MB / 1000;
  const TB = GB / 1000;

  return {
    B,
    KB,
    MB,
    GB,
    TB,
  };
};
