import { Ref, ref } from 'vue';

export default <TArgs extends any[], TReturn>(
  fn: (...args: TArgs) => Promise<TReturn>,
  loading: Ref<boolean> = ref(false),
) => ({
  loading,
  fn: async (...args: TArgs) => {
    loading.value = true;
    const result = await fn(...args);
    loading.value = false;
    return result;
  },
});
