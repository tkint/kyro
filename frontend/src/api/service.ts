import { handleApiCall, queryParams } from '@/api';
import { CFApplication } from '@/models/cf/application';
import {
  CFServiceBinding,
  CFServiceInstance,
  PaginatedServiceBindings,
  PaginatedServiceInstances,
} from '@/models/cf/service';
import { useAuthStore } from '@/stores/auth';

export default {
  getAllInstances: async (options?: Partial<{ page: number; perPage: number }>) => {
    return await handleApiCall<PaginatedServiceInstances>({
      path: `/v3/service_instances`,
      query: queryParams({
        page: options?.page,
        per_page: options?.perPage,
      }),
      authorization: useAuthStore().getAuthorization,
    });
  },
  getBindingsForApplication: async (guid: CFApplication['guid']) => {
    return await handleApiCall<PaginatedServiceBindings>({
      path: `/v3/service_credential_bindings`,
      query: {
        app_guids: [guid],
      },
      authorization: useAuthStore().getAuthorization,
    });
  },
  getBindingsForInstance: async (guid: CFServiceInstance['guid']) => {
    return await handleApiCall<PaginatedServiceBindings>({
      path: `/v3/service_credential_bindings`,
      query: {
        service_instance_guids: [guid],
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
  deleteBinding: async (guid: CFServiceBinding['guid']) => {
    return await handleApiCall({
      path: `/v3/service_credential_bindings/${guid}`,
      method: 'DELETE',
      authorization: useAuthStore().getAuthorization,
    });
  },
  deleteInstance: async (guid: CFServiceInstance['guid']) => {
    return await handleApiCall({
      path: `/v3/service_instances/${guid}`,
      method: 'DELETE',
      authorization: useAuthStore().getAuthorization,
    });
  },
};
