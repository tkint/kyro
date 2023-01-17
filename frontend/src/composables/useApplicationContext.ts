import { Ref } from 'vue';
import { CFApplication } from '@/models/cf/application';
import { CFEnvironmentVariables } from '@/models/cf/environment';
import { PaginatedProcessStats } from '@/models/cf/process';
import useContext from './useContext';

type ApplicationContextPart = 'application' | 'environment' | 'processes';
export interface ApplicationContext {
  application: Ref<CFApplication | undefined>;
  environment: Ref<CFEnvironmentVariables | undefined>;
  processes: Ref<PaginatedProcessStats | undefined>;

  reload: (part: ApplicationContextPart, ...others: ApplicationContextPart[]) => void;
}

const { provide, inject } = useContext<ApplicationContext>();

export const provideApplicationContext = provide;

export default () => {
  const context = inject();

  if (!context) {
    throw Error('Context not initialized');
  }

  return context;
};
