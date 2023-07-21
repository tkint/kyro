import { ApiErrorResponse } from '@/api';
import { CFPaginated } from '@/models/cf/common';
import { Result } from '@/utils/result';
import { range, uniqBy } from 'lodash';
import { computed, readonly, ref } from 'vue';

export const useLoadData = <TData, TError = ApiErrorResponse>(
  loader: () => Promise<Result<TData, TError>>,
  loading = ref(false),
) => {
  const response = ref<Result<TData, TError>>();

  return {
    loading: readonly(loading),
    response: computed(() => response.value),
    data: computed(() => (response.value?.success ? response.value.data : undefined)),
    error: computed(() => (!response.value?.success ? response.value?.error : undefined)),
    loadData: async () => {
      loading.value = true;
      const result = await loader();
      loading.value = false;
      return (response.value = result);
    },
    resetData: () => {
      response.value = undefined;
      loading.value = false;
    },
  };
};

export const useLoadPaginatedData = <TData extends CFPaginated<any>, TError = ApiErrorResponse>(
  loader: (page: number) => Promise<Result<TData, TError>>,
  loading = ref(false),
) =>
  useLoadData(async () => {
    const result = await loader(1);

    if (!result.success) return result;

    const { total_pages } = result.data.pagination;
    const included = result.data.included ?? {};

    if (total_pages > 1) {
      (await Promise.all(range(2, total_pages + 1).map((page) => loader(page)))).forEach((pageResponse) => {
        if (pageResponse.success) {
          result.data.resources.push(...pageResponse.data.resources);
          Object.entries(pageResponse.data.included ?? {}).forEach(([key, values]) => {
            included[key] = uniqBy([...included[key], ...values], (item) => item.guid);
          });
        }
      });
    }

    return {
      ...result,
      included,
    };
  }, loading);

export default useLoadData;
