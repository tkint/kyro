import { handleApiCall } from '@/api';
import { Paginated } from '@/models/cf/common';
import { CFOrganization } from '@/models/cf/organization';
import { useAuthStore } from '@/stores/auth';

export default {
  getAll: async () => {
    return handleApiCall<Paginated<CFOrganization>>({
      path: '/v3/organizations',
      query: {
        per_page: 200,
      },
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
