import { Ref, readonly, ref } from 'vue';

export const useLoadingFn = <TArgs extends any[], TReturn>(
  fn: (...args: TArgs) => Promise<TReturn>,
  loading: Ref<boolean> = ref(false),
) => ({
  fn: async (...args: TArgs) => {
    loading.value = true;
    const result = await fn(...args);
    loading.value = false;
    return result;
  },
  loading: readonly(loading),
});

export const useLoadingFnWithCheck = <TArgs extends any[]>(
  action: (launchPolling: () => Promise<{ iterations: number }>, ...args: TArgs) => Promise<void>,
  stop: () => Promise<boolean>,
  interval: number = 3000,
  loading: Ref<boolean> = ref(false),
) => {
  const launchPolling = () =>
    new Promise<{ iterations: number }>(async (resolve) => {
      let iterations = 0;
      if ((loading.value = !(await stop()))) {
        const intervalId = setInterval(async () => {
          iterations++;
          if (!(loading.value = !(await stop()))) {
            clearInterval(intervalId);
            resolve({ iterations });
          }
        }, interval);
      } else {
        resolve({ iterations });
      }
    });

  const { fn } = useLoadingFn(
    (...args: TArgs) =>
      new Promise(async (resolve) => {
        loading.value = true;
        action(async () => {
          const result = await launchPolling();
          resolve(undefined);
          return result;
        }, ...args);
      }),
    loading,
  );

  return {
    fn,
    launchPolling,
    loading: readonly(loading),
  };
};

export default useLoadingFn;
