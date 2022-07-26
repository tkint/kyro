import { CFApplication } from '@/models/cf/application';
import { CFProcessType, PaginatedProcesses } from '@/models/cf/process';
import { useAuthStore } from '@/stores/auth';
import { handleApiCall } from '.';

export default {
  getForApplication: async (guid: CFApplication['guid'], processType: CFProcessType) => {
    return handleApiCall<PaginatedProcesses>({
      path: `/v3/apps/${guid}/processes/${processType}/stats`,
      authorization: useAuthStore().getAuthorization,
    });
  },
};
