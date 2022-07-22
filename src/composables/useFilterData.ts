import { memoUpperCase } from "@/utils/string";
import { computed, reactive } from "vue";

type Filters = {
  text?: string;
};

type Helpers = {
  includesText: (...values: string[]) => boolean;
};

export default <TObject>(
  filterData: (filters: Filters, helpers: Helpers) => TObject[] | undefined
) => {
  const filters = reactive<Filters>({});

  const includesText: Helpers["includesText"] = (...values: string[]) => {
    const text = memoUpperCase(filters.text);
    if (!text) return true;
    return !!values.find((value) => memoUpperCase(value)?.includes(text));
  };

  return {
    filters,
    filteredData: computed(() => filterData(filters, { includesText }) || []),
  };
};
