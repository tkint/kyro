import { handleApiCall } from '@/api';
import { CFOrganization, PaginatedOrganizations } from '@/models/cf/organization';
import { useAuthStore } from '@/stores/auth';

export default {
  getAll: async () => {
    return handleApiCall<PaginatedOrganizations>({
      path: '/v3/organizations',
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
