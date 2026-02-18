import { handleApiCall, queryParams } from '@/api';
import { CFSpace, PaginatedSpaces } from '@/models/cf/space';
import { useAuthStore } from '@/stores/auth';

export default {
  getAll: async (options?: Partial<{ page: number; perPage: number }>) => {
    return handleApiCall<PaginatedSpaces>({
      path: '/v3/spaces',
      query: queryParams({
        page: options?.page,
        per_page: options?.perPage ?? 200,
      }),
      authorization: useAuthStore().getAuthorization,
    });
  },
  getOne: async (guid: CFSpace['guid']) => {
    return handleApiCall<CFSpace>({
      path: `/v3/spaces/${guid}`,
      authorization: useAuthStore().getAuthorization,
    });
  },
};
