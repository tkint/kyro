import { Ref, computed, reactive, ref, unref, watch } from 'vue';

export default <T>(data: Ref<T[]>, options: { perPage: number | Ref<number> }) => {
  const perPage = computed(() => unref(options.perPage));

  const currentPage = ref(1);

  const pages = computed(() => Math.ceil(data.value.length / perPage.value));

  watch(pages, (newValue) => {
    if (newValue < currentPage.value) {
      currentPage.value = newValue;
    }
  });

  return {
    data: computed(() => {
      const page = unref(currentPage);
      const length = unref(perPage);

      const start = (page - 1) * length;
      const end = page * length;

      return data.value.slice(start, end);
    }),
    pagination: reactive({
      page: currentPage,
      pages: pages,
    }),
  };
};
