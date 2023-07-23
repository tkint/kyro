import { CFApplication } from '@/models/cf/application';
import { CFProcessType, ProcessStatsResources } from '@/models/cf/process';
import { useAuthStore } from '@/stores/auth';
import { handleApiCall } from '.';

export default {
  getStatsForApplication: async (guid: CFApplication['guid'], processType: CFProcessType) => {
    return handleApiCall<ProcessStatsResources>({
      path: `/v3/apps/${guid}/processes/${processType}/stats`,
      authorization: useAuthStore().getAuthorization,
    });
  },
};
