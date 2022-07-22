import { handleApiCall } from '@/api';
import { Paginated } from '@/models/cf/common';
import { CFSpace } from '@/models/cf/space';
import { useAuthStore } from '@/stores/auth';

export default {
  getAll: async () => {
    return handleApiCall<Paginated<CFSpace>>({
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
