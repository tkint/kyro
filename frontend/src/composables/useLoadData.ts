import { ApiErrorResponse } from '@/api';
import { CFPaginated } from '@/models/cf/common';
import { distinct } from '@/utils/array';
import { range } from '@/utils/common';
import { Result } from '@/utils/result';
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
) =>
  useLoadData(async () => {
    const result = await loader(1);

    if (!result.success) return result;

    const { total_pages } = result.data.pagination;
    const included = result.data.included ?? {};

    if (total_pages > 1) {
      (await Promise.all(range(2, total_pages).map((page) => loader(page)))).forEach((pageResponse) => {
        if (pageResponse.success) {
          result.data.resources.push(...pageResponse.data.resources);
          Object.entries(pageResponse.data.included ?? {}).forEach(([key, values]) => {
            included[key] = distinct([...included[key], ...values], (item) => item.guid);
          });
        }
      });
    }

    return {
      ...result,
      included,
    };
  });

export default useLoadData;

// export const useLoadPaginatedData = <TData extends CFPaginated<any>, TError = ApiErrorResponse>(
//   loader: (options: { page: number; perPage: number }) => Promise<ApiResponse<TData, TError>>,
//   loading = ref(false),
// ) => {
//   type TResource = TData extends CFPaginated<infer T> ? T : never;

//   const responses = ref<ApiResponse<TData, TError>[]>([]);

//   return {
//     loading: readonly(loading),
//     responses: computed(() => responses.value),
//     data: computed<TData | undefined>(() => {
//       if (responses.value.every((response) => !response.success)) return undefined;

//       const result: TData = {
//         resources: [],
//         included: undefined,
//       };

//       responses.value.forEach((response) => {
//         if (response.success) {
//           result.resources.push(...response.data.resources);
//           if (!result.included) result.included = response.data.included;
//           else {
//             Object.entries(result.included).forEach(([includedKey, includes]) => {
//               result.included!![includedKey] = distinct(
//                 includes.concat(response.data.included?.[includedKey] ?? []),
//                 (include) => include.guid,
//               );
//             });
//           }
//         }
//       });

//       return result;
//     }),
//     errors: computed(() =>
//       responses.value.reduce<TError[]>((result, response, _) => {
//         if (!response.success) return [...result, response.error as TError];
//         return result;
//       }, []),
//     ),
//     loadData: async (page: number = 1, perPage: number = 10) => {
//       loading.value = true;

//       let result: ApiResponse<TData, TError> = await loader({ page, perPage });
//       responses.value = [result];

//       if (result.success) {
//         let currentPage = page;
//         const { total_pages, total_results } = result.data.pagination;

//         while (currentPage < total_pages) {
//           result = await loader({ page: ++currentPage, perPage });
//           responses.value.push(result);
//         }
//       }

//       loading.value = false;
//       return readonly(responses.value);
//     },
//     resetData: () => {
//       responses.value = [];
//       loading.value = false;
//     },
//   };
// };
