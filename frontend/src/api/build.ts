import { handleApiCall, queryParams } from '@/api';
import { CFApplication } from '@/models/cf/application';
import { CFBuild, PaginatedBuilds } from '@/models/cf/build';
import { CFSortedBy } from '@/models/cf/common';
import { CFPackage } from '@/models/cf/package';
import { useAuthStore } from '@/stores/auth';

export default {
  createForPackage: async (guid: CFPackage['guid']) => {
    return handleApiCall<CFBuild>({
      path: `/v3/builds`,
      method: 'POST',
      body: {
        package: {
          guid,
        },
      },
      authorization: useAuthStore().getAuthorization,
    });
  },
  listForApplication: async (
    guid: CFApplication['guid'],
    options?: Partial<{
      states: CFBuild.State[];
      page: number;
      perPage: number;
      orderBy: CFSortedBy<'created_at' | 'updated_at'>;
    }>,
  ) => {
    return handleApiCall<PaginatedBuilds>({
      path: `/v3/apps/${guid}/builds`,
      query: queryParams({
        states: options?.states?.join(','),
        page: options?.page,
        per_page: options?.perPage,
        order_by: options?.orderBy,
      }),
      authorization: useAuthStore().getAuthorization,
    });
  },
  getOne: async (guid: CFBuild['guid']) => {
    return handleApiCall<CFBuild>({
      path: `/v3/builds/${guid}`,
      authorization: useAuthStore().getAuthorization,
    });
  },
};
