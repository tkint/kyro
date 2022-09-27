import { handleApiCall, TODO } from '@/api';
import { CFApplication, PaginatedApplications } from '@/models/cf/application';
import { CFInclude } from '@/models/cf/common';
import { useAuthStore } from '@/stores/auth';

export default {
  getAll: async (
    options?: Partial<{ includes: (CFInclude.SPACE | CFInclude.SPACE_ORGANIZATION)[]; page: number; perPage: number }>,
  ) => {
    return handleApiCall<PaginatedApplications>({
      path: '/v3/apps',
      query: {
        ...(options?.page && { page: options.page }),
        ...(options?.perPage && { per_page: options.perPage }),
        ...(options?.includes && { include: options.includes }),
      },
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
};
