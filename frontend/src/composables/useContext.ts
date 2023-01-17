import { inject, provide } from 'vue';

interface UseContextReturn<T> {
  provide: (context: T) => void;
  inject: () => T;
}

export default <T>(): UseContextReturn<T> => {
  const contextKey = Symbol();

  return {
    provide: (context: T) => provide(contextKey, context),
    inject: () => inject(contextKey)!,
  };
};
