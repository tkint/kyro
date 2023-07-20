import { handleApiCall } from '@/api';
import { CFApplication } from '@/models/cf/application';
import {
  CFServiceBinding,
  CFServiceInstance,
  PaginatedServiceBindings,
  PaginatedServiceInstances,
} from '@/models/cf/service';
import { useAuthStore } from '@/stores/auth';

export default {
  getBindingsForApplication: async (guid: CFApplication['guid']) => {
    return await handleApiCall<PaginatedServiceBindings>({
      path: `/v3/service_credential_bindings`,
      query: {
        app_guids: [guid],
      },
      authorization: useAuthStore().getAuthorization,
    });
  },
  getInstances: async (guids: CFServiceInstance['guid'][]) => {
    return await handleApiCall<PaginatedServiceInstances>({
      path: `/v3/service_instances`,
      query: {
        guids: guids,
      },
      authorization: useAuthStore().getAuthorization,
    });
  },
  getBindingsDetails: async (guid: CFServiceBinding['guid']) => {
    return await handleApiCall<object>({
      path: `/v3/service_credential_bindings/${guid}/details`,
      authorization: useAuthStore().getAuthorization,
    });
  },
};
