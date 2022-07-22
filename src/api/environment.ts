import { ApiResponse, handleApiCall } from '.';
import { CFApplication } from '@/models/cf/application';
import { EnvironmentVariables } from '@/models/cf/environment';
import { useAuthStore } from '@/stores/auth';

export default {
  getForApplication: async (guid: CFApplication['guid']): Promise<ApiResponse<EnvironmentVariables>> => {
    return handleApiCall<EnvironmentVariables>({
      path: `/v3/apps/${guid}/environment_variables`,
      authorization: useAuthStore().getAuthorization,
    });
  },
};
