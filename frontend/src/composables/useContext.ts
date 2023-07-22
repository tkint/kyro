import { inject, provide } from 'vue';

type UseContextReturn<T> = {
  provide: (context: T) => void;
  inject: () => T;
};

export default <T>(): UseContextReturn<T> => {
  const contextKey = Symbol();

  return {
    provide: (context: T) => provide(contextKey, context),
    inject: () => {
      const context = inject<T>(contextKey);

      if (!context) {
        throw Error('Context not initialized');
      }

      return context;
    },
  };
};
