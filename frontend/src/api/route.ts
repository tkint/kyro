import { handleApiCall, queryParams } from '@/api';
import { CFApplication } from '@/models/cf/application';
import { CFDomain, PaginatedDomains } from '@/models/cf/domain';
import { CFOrganization } from '@/models/cf/organization';
import { CFRoute, PaginatedRoutes } from '@/models/cf/route';
import { RouteInput } from '@/models/route';
import { useAuthStore } from '@/stores/auth';

export default {
  list: async (
    options?: Partial<{
      appGuids: CFApplication['guid'][];
      domainGuids: CFDomain['guid'][];
      organizationGuids: CFOrganization['guid'][];
      spaceGuids: CFOrganization['guid'][];
      serviceInstanceGuids: CFOrganization['guid'][];
      hosts: string[];
      paths: string[];
      page: number;
      perPage: number;
    }>,
  ) => {
    return handleApiCall<PaginatedRoutes>({
      path: `/v3/routes`,
      query: queryParams({
        app_guids: options?.appGuids?.join(','),
        domain_guids: options?.domainGuids?.join(','),
        organization_guids: options?.organizationGuids?.join(','),
        space_guids: options?.spaceGuids?.join(','),
        service_instance_guids: options?.serviceInstanceGuids?.join(','),
        hosts: options?.hosts?.join(','),
        paths: options?.paths?.join(','),
        page: options?.page,
        per_page: options?.perPage,
      }),
      authorization: useAuthStore().getAuthorization,
    });
  },
  listForApplication: async (
    guid: CFApplication['guid'],
    options?: Partial<{
      page: number;
      perPage: number;
    }>,
  ) => {
    return handleApiCall<PaginatedRoutes>({
      path: `/v3/apps/${guid}/routes`,
      query: queryParams({
        page: options?.page,
        per_page: options?.perPage,
      }),
      authorization: useAuthStore().getAuthorization,
    });
  },
  create: async (input: RouteInput) => {
    return handleApiCall<CFRoute>({
      path: `/v3/routes`,
      method: 'POST',
      body: {
        host: input.host,
        path: input.path,
        port: input.port,
        relationships: {
          domain: {
            data: {
              guid: input.domainGuid,
            },
          },
          space: {
            data: {
              guid: input.spaceGuid,
            },
          },
        },
      },
      authorization: useAuthStore().getAuthorization,
    });
  },
  insertDestinations: async (
    guid: CFRoute['guid'],
    destinations: {
      app: {
        guid: CFApplication['guid'];
        process?: CFRoute.Destination.App.Process;
      };
      port?: number;
      weight?: number;
      protocol?: CFRoute.Destination.Protocol;
    }[],
  ) => {
    return handleApiCall<{ destinations: CFRoute.Destination[] }>({
      path: `/v3/routes/${guid}/destinations`,
      method: 'POST',
      body: {
        destinations,
      },
      authorization: useAuthStore().getAuthorization,
    });
  },
  deleteDestination: async (routeGuid: CFRoute['guid'], destinationGuid: CFRoute.Destination['guid']) => {
    return handleApiCall({
      path: `/v3/routes/${routeGuid}/destinations/${destinationGuid}`,
      method: 'DELETE',
      authorization: useAuthStore().getAuthorization,
    });
  },
  listDomains: async (options?: Partial<{ page: number; perPage: number }>) => {
    return handleApiCall<PaginatedDomains>({
      path: `/v3/domains`,
      query: queryParams({
        page: options?.page,
        per_page: options?.perPage,
      }),
      authorization: useAuthStore().getAuthorization,
    });
  },
};
