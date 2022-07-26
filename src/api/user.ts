import { handleApiCall } from '@/api';
import { Paginated } from '@/models/cf/common';
import { CFUser } from '@/models/cf/user';
import { useAuthStore } from '@/stores/auth';

export default {
  getAll: async () => {
    return handleApiCall<Paginated<CFUser>>({
      path: '/v3/users',
      authorization: useAuthStore().getAuthorization,
    });
  },
  getOne: async (guid: CFUser['guid']) => {
    return handleApiCall<CFUser>({
      path: `/v3/users/${guid}`,
      authorization: useAuthStore().getAuthorization,
    });
  },
};
