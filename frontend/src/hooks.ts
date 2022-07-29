import { onActivated, ref } from 'vue';

export const onCachedActivated = <TValue>(controller: () => TValue, hook: (invalidate: boolean) => any) => {
  const cachedValue = ref<TValue>();
  cachedValue.value = controller();

  onActivated(() => {
    const newValue = controller();
    hook(newValue !== cachedValue.value);
    cachedValue.value = newValue;
  });
};
