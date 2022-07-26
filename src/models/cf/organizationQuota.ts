import { CFLink, CFMetaData, CFResourceWithRelationShips, CFPaginated, CFToManyRelationship } from '@/models/cf/common';

export interface CFOrganizationQuota extends CFResourceWithRelationShips {
  name: string;
  apps: CFOrganizationQuota.Apps;
  services: CFOrganizationQuota.Services;
  routes: CFOrganizationQuota.Routes;
  domains: CFOrganizationQuota.Domains;
  relationships: {
    organizations: CFToManyRelationship;
  };
  metadata: CFMetaData;
  links: {
    self: CFLink;
  };
}

export namespace CFOrganizationQuota {
  export interface Apps {
    per_process_memory_in_mb: number | null;
    total_memory_in_mb: number | null;
    total_instances: number | null;
    per_app_tasks: number | null;
  }

  export interface Services {
    paid_services_allowed: number | null;
    total_service_instances: number | null;
    total_service_keys: number | null;
  }

  export interface Routes {
    total_routes: number | null;
    total_reserved_ports: number | null;
  }

  export interface Domains {
    total_domains: number | null;
  }
}

export type PaginatedOrganizationQuotas = CFPaginated<CFOrganizationQuota>;
