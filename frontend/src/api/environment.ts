import { CFApplication } from '@/models/cf/application';
import { CFEnvironmentVariables } from '@/models/cf/environment';
import { EnvironmentVariableInput } from '@/models/environment';
import { useAuthStore } from '@/stores/auth';
import { handleApiCall } from '.';

export default {
  getForApplication: async (guid: CFApplication['guid']) => {
    return handleApiCall<CFEnvironmentVariables>({
      path: `/v3/apps/${guid}/env`,
      authorization: useAuthStore().getAuthorization,
    });
  },
  setVariableForApplication: async (guid: CFApplication['guid'], variable: EnvironmentVariableInput) => {
    return handleApiCall({
      path: `/v3/apps/${guid}/environment_variables`,
      method: 'PATCH',
      body: {
        var: {
          [variable.key]: variable.value,
        },
      },
      authorization: useAuthStore().getAuthorization,
    });
  },
  unsetVariableForApplication: async (guid: CFApplication['guid'], variableKey: string) => {
    return handleApiCall({
      path: `/v3/apps/${guid}/environment_variables`,
      method: 'PATCH',
      body: {
        var: {
          [variableKey]: null,
        },
      },
      authorization: useAuthStore().getAuthorization,
    });
  },
};
