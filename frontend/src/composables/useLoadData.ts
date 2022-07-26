import { computed, reactive, readonly, ref } from 'vue';
import { ApiErrorResponse, ApiResponse } from '@/api';
import { CFPaginated } from '@/models/cf/common';
import { distinct } from '@/utils/array';

export default <TData, TError = ApiErrorResponse>(
  loader: () => Promise<ApiResponse<TData, TError>>,
  loading = ref(false),
) => {
  const response = ref<ApiResponse<TData, TError>>();

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
