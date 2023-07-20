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
};
