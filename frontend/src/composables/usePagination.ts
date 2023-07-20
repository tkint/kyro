import { Ref, computed, reactive, ref, unref, watch } from 'vue';

export default <T>(data: Ref<T[]>, options: { perPage: number | Ref<number> }) => {
  const perPage = computed(() => unref(options.perPage));

  const currentPage = ref(1);

  const pages = computed(() => Math.ceil(data.value.length / perPage.value));

  watch(pages, (newValue, oldValue) => {
    if (oldValue < 1) {
      currentPage.value = 1;
    } else if (currentPage.value > newValue) {
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
