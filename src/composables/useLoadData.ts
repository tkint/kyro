import { computed, readonly, ref } from 'vue';
import { ApiErrorResponse, ApiResponse } from '@/api';

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
