import { handleApiCall } from '@/api';
import { CFApplication } from '@/models/cf/application';
import { PaginatedRoutes } from '@/models/cf/route';
import { useAuthStore } from '@/stores/auth';

export default {
  getForApplication: async (guid: CFApplication['guid']) => {
    return handleApiCall<PaginatedRoutes>({
      path: `/v3/apps/${guid}/routes`,
      authorization: useAuthStore().getAuthorization,
    });
  },
};
