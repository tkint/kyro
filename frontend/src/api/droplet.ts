import { handleApiCall, queryParams } from '@/api';
import { CFApplication } from '@/models/cf/application';
import { CFSortedBy } from '@/models/cf/common';
import { CFDroplet, PaginatedDroplets } from '@/models/cf/droplet';
import { CFPackage, PaginatedPackages } from '@/models/cf/package';
import { useAuthStore } from '@/stores/auth';

export default {
  listForApplication: async (
    guid: CFApplication['guid'],
    options?: Partial<{
      guids: CFDroplet['guid'][];
      states: CFDroplet.State[];
      current: boolean;
      page: number;
      perPage: number;
      orderBy: CFSortedBy<'created_at' | 'updated_at'>;
    }>,
  ) => {
    return handleApiCall<PaginatedDroplets>({
      path: `/v3/apps/${guid}/droplets`,
      query: queryParams({
        guids: options?.guids?.join(','),
        states: options?.states?.join(','),
        current: options?.current,
        page: options?.page,
        per_page: options?.perPage,
        order_by: options?.orderBy,
      }),
      authorization: useAuthStore().getAuthorization,
    });
  },
};
