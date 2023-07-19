import { handleApiCall, queryParams } from '@/api';
import { CFOrganization, PaginatedOrganizations } from '@/models/cf/organization';
import { useAuthStore } from '@/stores/auth';

export default {
  getAll: async (options?: Partial<{ names: string[]; page: number; perPage: number }>) => {
    return handleApiCall<PaginatedOrganizations>({
      path: '/v3/organizations',
      query: queryParams({
        names: options?.names?.join(','),
        page: options?.page,
        per_page: options?.perPage,
      }),
      authorization: useAuthStore().getAuthorization,
    });
  },
  getOne: async (guid: CFOrganization['guid']) => {
    return handleApiCall<CFOrganization>({
      path: `/v3/organizations/${guid}`,
      authorization: useAuthStore().getAuthorization,
    });
  },
};
