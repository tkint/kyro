import { handleApiCall } from '@/api';
import { CFUser } from '@/models/cf/user';
import { useAuthStore } from '@/stores/auth';

export default {
  getOne: async (guid: CFUser['guid']) => {
    return handleApiCall<CFUser>({
      path: `/v3/users/${guid}`,
      authorization: useAuthStore().getAuthorization,
    });
  },
};
