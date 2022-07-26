import { CFApplication } from '@/models/cf/application';
import { CFEnvironmentVariables } from '@/models/cf/environment';
import { useAuthStore } from '@/stores/auth';
import { handleApiCall } from '.';

export default {
  getForApplication: async (guid: CFApplication['guid']) => {
    return handleApiCall<CFEnvironmentVariables>({
      path: `/v3/apps/${guid}/env`,
      authorization: useAuthStore().getAuthorization,
    });
  },
};
