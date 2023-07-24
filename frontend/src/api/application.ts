import { handleApiCall, queryParams, TODO } from '@/api';
import { CFApplication, PaginatedApplications } from '@/models/cf/application';
import { CFInclude } from '@/models/cf/common';
import { useAuthStore } from '@/stores/auth';

export default {
  getAll: async (
    options?: Partial<{ includes: (CFInclude.SPACE | CFInclude.SPACE_ORGANIZATION)[]; page: number; perPage: number }>,
  ) => {
    return handleApiCall<PaginatedApplications>({
      path: '/v3/apps',
      query: queryParams({
        include: options?.includes,
        page: options?.page,
        per_page: options?.perPage,
      }),
      authorization: useAuthStore().getAuthorization,
    });
  },
  getOne: async (
    guid: CFApplication['guid'],
    options?: Partial<{ includes: (CFInclude.SPACE | CFInclude.SPACE_ORGANIZATION)[] }>,
  ) => {
    return handleApiCall<CFApplication>({
      path: `/v3/apps/${guid}`,
      query: options?.includes && {
        include: options.includes,
      },
      authorization: useAuthStore().getAuthorization,
    });
  },
  executeAction: async (guid: CFApplication['guid'], action: 'start' | 'stop' | 'restart') => {
    return handleApiCall<CFApplication>({
      path: `/v3/apps/${guid}/actions/${action}`,
      method: 'POST',
      authorization: useAuthStore().getAuthorization,
    });
  },
  restage: async (guid: CFApplication['guid']) => {
    return TODO(
      'A implémenter. Voir : https://v3-apidocs.cloudfoundry.org/version/3.122.0/index.html#deprecated-endpoints',
    );
  },
  start: async (guid: CFApplication['guid']) => {
    return handleApiCall({
      path: `/v3/apps/${guid}/actions/start`,
      method: 'POST',
      authorization: useAuthStore().getAuthorization,
    });
  },
  stop: async (guid: CFApplication['guid']) => {
    return handleApiCall({
      path: `/v3/apps/${guid}/actions/stop`,
      method: 'POST',
      authorization: useAuthStore().getAuthorization,
    });
  },
  restart: async (guid: CFApplication['guid']) => {
    return handleApiCall({
      path: `/v3/apps/${guid}/actions/restart`,
      method: 'POST',
      authorization: useAuthStore().getAuthorization,
    });
  },
};
