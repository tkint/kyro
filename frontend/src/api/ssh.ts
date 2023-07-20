import { CFApplication } from '@/models/cf/application';
import { CFSSHEnabled } from '@/models/cf/ssh';
import { useAuthStore } from '@/stores/auth';
import { handleApiCall } from '.';

export default {
  getSSHEnabledForApplication: async (guid: CFApplication['guid']) => {
    return handleApiCall<CFSSHEnabled>({
      path: `/v3/apps/${guid}/ssh_enabled`,
      authorization: useAuthStore().getAuthorization,
    });
  },
};
