import { handleApiCall, queryParams } from '@/api';
import { CFApplication } from '@/models/cf/application';
import { PaginatedDomains } from '@/models/cf/domain';
import { PaginatedRoutes } from '@/models/cf/route';
import { useAuthStore } from '@/stores/auth';

export default {
  getForApplication: async (guid: CFApplication['guid']) => {
    return handleApiCall<PaginatedRoutes>({
      path: `/v3/apps/${guid}/routes`,
      authorization: useAuthStore().getAuthorization,
    });
  },
  listDomains: async (options?: Partial<{ page: number; perPage: number }>) => {
    return handleApiCall<PaginatedDomains>({
      path: `/v3/domains`,
      query: queryParams({
        page: options?.page,
        per_page: options?.perPage,
      }),
      authorization: useAuthStore().getAuthorization,
    });
  },
};
