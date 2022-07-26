import { computed, reactive } from 'vue';
import { arrayOfNotUndefined } from '@/utils/array';
import { memoUpperCase } from '@/utils/string';

type Filters = {
  text?: string;
};

type Helpers = {
  includesText: (...values: (string | undefined)[]) => boolean;
};

export default <TObject>(computeData: (filters: Filters, helpers: Helpers) => TObject[] | undefined) => {
  const filters = reactive<Filters>({});

  const includesText: Helpers['includesText'] = (...values: (string | undefined)[]) => {
    const text = memoUpperCase(filters.text);
    if (!text) return true;
    return !!arrayOfNotUndefined(...values).find((value) => memoUpperCase(value)?.includes(text));
  };

  return {
    filters,
    computedData: computed(() => computeData(filters, { includesText }) || []),
  };
};
