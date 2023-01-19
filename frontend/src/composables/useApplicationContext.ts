import { Ref } from 'vue';
import useContext from '@/composables/useContext';
import { CFApplication } from '@/models/cf/application';
import { CFEnvironmentVariables } from '@/models/cf/environment';
import { PaginatedProcessStats } from '@/models/cf/process';
import { PaginatedServiceInstances } from '@/models/cf/service';

type ApplicationContextPart = 'application' | 'environment' | 'services' | 'processes';
export interface ApplicationContext {
  application: Ref<CFApplication | undefined>;
  environment: Ref<CFEnvironmentVariables | undefined>;
  services: Ref<PaginatedServiceInstances | undefined>;
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
