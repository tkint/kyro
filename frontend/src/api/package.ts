import { handleApiCall, queryParams } from '@/api';
import { CFApplication } from '@/models/cf/application';
import { CFSortedBy } from '@/models/cf/common';
import { CFPackage, PaginatedPackages } from '@/models/cf/package';
import { useAuthStore } from '@/stores/auth';

export default {
  listForApplication: async (
    guid: CFApplication['guid'],
    options?: Partial<{
      guids: CFPackage['guid'][];
      states: CFPackage.State[];
      types: CFPackage.Type[];
      page: number;
      perPage: number;
      orderBy: CFSortedBy<'created_at' | 'updated_at'>;
    }>,
  ) => {
    return handleApiCall<PaginatedPackages>({
      path: `/v3/apps/${guid}/packages`,
      query: queryParams({
        guids: options?.guids?.join(','),
        states: options?.states?.join(','),
        types: options?.types?.join(','),
        page: options?.page,
        per_page: options?.perPage,
        order_by: options?.orderBy,
      }),
      authorization: useAuthStore().getAuthorization,
    });
  },
};
