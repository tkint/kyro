import { ApiErrorResponse } from '@/api';
import useContext from '@/composables/useContext';
import { CFApplication } from '@/models/cf/application';
import { ComputedRef, Ref, computed } from 'vue';

type Event = 'reload' | 'reset';

export interface ApplicationContext {
  guid: ComputedRef<CFApplication['guid']>;
  loading: Ref<boolean>;
  errors: Ref<ApiErrorResponse[]>;
  application: ComputedRef<CFApplication | undefined>;
  on: (event: Event, listener: () => void) => void;
}

const { provide, inject } = useContext<ApplicationContext>();

export const provideApplicationContext = (context: Omit<ApplicationContext, 'on'>) => {
  const listeners: Record<Event, (() => void)[]> = {
    reload: [],
    reset: [],
  };

  provide({
    ...context,
    on: (event, listener) => {
      listeners[event].push(listener);
    },
  });

  return {
    trigger: (event: Event) => {
      listeners[event].forEach((listener) => listener());
    },
  };
};

export default (): ApplicationContext & { application: ComputedRef<CFApplication> } => {
  const context = inject();

  if (!context.application.value) {
    throw Error('Context not initialized');
  }

  return {
    ...context,
    application: computed(() => context.application.value!!),
  };
};
