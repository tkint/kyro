import { handleApiCall, TODO } from '@/api';
import { CFApplication, PaginatedApplications } from '@/models/cf/application';
import { useAuthStore } from '@/stores/auth';
import { arrayOfNotFalsy } from '@/utils/array';

export default {
  getAll: async () => {
    return handleApiCall<PaginatedApplications>({
      path: '/v3/apps',
      query: {
        per_page: 200,
      },
      authorization: useAuthStore().getAuthorization,
    });
  },
  getOne: async (guid: CFApplication['guid'], options?: { includeSpace: boolean; includeOrg: boolean }) => {
    return handleApiCall<CFApplication>({
      path: `/v3/apps/${guid}`,
      query: options && {
        include: arrayOfNotFalsy(options.includeSpace && 'space', options.includeOrg && 'space.organization'),
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
