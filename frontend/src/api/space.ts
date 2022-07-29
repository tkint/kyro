import { handleApiCall } from '@/api';
import { CFSpace, PaginatedSpaces } from '@/models/cf/space';
import { useAuthStore } from '@/stores/auth';

export default {
  getAll: async () => {
    return handleApiCall<PaginatedSpaces>({
      path: '/v3/spaces',
      query: {
        per_page: 200,
      },
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
