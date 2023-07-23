import { ApiErrorResponse } from '@/api';
import useLoadingFn from '@/composables/useLoadingFn';
import { CFPaginated } from '@/models/cf/common';
import { Result } from '@/utils/result';
import { range, uniqBy } from 'lodash';
import { computed, readonly, ref } from 'vue';

export const useApiCall = <TArgs extends any[], TData, TError = ApiErrorResponse>(
  loader: (...args: TArgs) => Promise<Result<TData, TError>>,
  loading = ref(false),
) => {
  const result = ref<Result<TData, TError>>();

  const { fn: execute } = useLoadingFn<TArgs, Result<TData, TError>>(
    async (...args) => (result.value = await loader(...args)),
    loading,
  );

  return {
    loading: readonly(loading),
    result: computed(() => result.value),
    data: computed(() => (result.value?.success ? result.value.data : undefined)),
    error: computed(() => (!result.value?.success ? result.value?.error : undefined)),
    execute,
    reset: () => {
      result.value = undefined;
      loading.value = false;
    },
  };
};

export const loadPaginatedData = async <TData extends CFPaginated<any, any>, TError = ApiErrorResponse>(
  loader: (page: number) => Promise<Result<TData, TError>>,
): Promise<Result<TData, TError>> => {
  const result = await loader(1);

  if (!result.success) return result;

  const { total_pages } = result.data.pagination;
  const included = Object.assign({}, result.data.included);

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

  result.data.included = included;

  return result;
};

export const usePaginatedApiCall = <TData extends CFPaginated<any>, TError = ApiErrorResponse>(
  loader: (page: number) => Promise<Result<TData, TError>>,
  loading = ref(false),
) => useApiCall(() => loadPaginatedData(loader), loading);

export default useApiCall;
