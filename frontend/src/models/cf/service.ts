import { Dayjs } from 'dayjs';
import { CFLink, CFMetaData, CFPaginated, CFResourceWithRelationShips, CFToOneRelationship } from '@/models/cf/common';

export interface CFServiceInstance extends CFResourceWithRelationShips {
  name: string;
  type: 'managed' | 'user-provided';
  last_operation: CFServiceInstance.LastOperation;
  tags: string[];
  syslog_drain_url: string;
  route_service_url: string;
  maintenance_info: CFServiceInstance.Maintenanceinfo; // type == 'managed'
  upgrade_available: boolean; // type == 'managed'
  dashboard_url: string; // type == 'managed'
  relationships: {
    space: CFToOneRelationship;
    service_plan: CFToOneRelationship;
  };
  metadata: CFMetaData;
  links: {
    self: CFLink;
    space: CFLink;
    service_credential_bindings: CFLink;
    service_route_bindings: CFLink;
    service_plan: CFLink;
    parameters: CFLink;
    shared_spaces: CFLink;
  };
}

export namespace CFServiceInstance {
  export interface Maintenanceinfo {
    version: string;
    description: string;
  }

  export interface LastOperation {
    type: 'create' | 'update' | 'delete';
    state: 'initial' | 'in progress' | 'succeeded' | 'failed';
    description: string;
    created_at: Dayjs;
    updated_at: Dayjs;
  }
}

export type PaginatedServiceInstances = CFPaginated<CFServiceInstance>;

export interface CFServiceBinding extends CFResourceWithRelationShips {
  name: string;
  type: 'app' | 'key';
  last_operation: CFServiceBinding.LastOperation;
  relationships: {
    app: CFToOneRelationship;
    service_instance: CFToOneRelationship;
  };
  metadata: CFMetaData;
  links: {
    self: CFLink;
  };
}

export namespace CFServiceBinding {
  export interface LastOperation {
    type: 'create' | 'delete';
    state: 'initial' | 'in progress' | 'succeeded' | 'failed';
    description: string;
    created_at: Dayjs;
    updated_at: Dayjs;
  }
}

export type PaginatedServiceBindings = CFPaginated<CFServiceBinding>;
