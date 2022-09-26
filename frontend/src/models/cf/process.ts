import { CFLink, CFMetaData, CFPaginated, CFResource, CFToOneRelationship } from '@/models/cf/common';

export type CFProcessType = 'web';
export enum CFProcessState {
  RUNNING = 'RUNNING',
  CRASHED = 'CRASHED',
  STARTING = 'STARTING',
  DOWN = 'DOWN',
}

export interface CFProcess extends CFResource {
  type: CFProcessType;
  command: string;
  instances: number;
  memory_in_mb: number;
  disk_in_mb: number;
  health_check: CFProcess.Healthcheck;
  relationships: {
    app: CFToOneRelationship;
    revision: CFToOneRelationship;
  };
  metadata: CFMetaData;
  links: {
    self: CFLink;
    scale: CFLink;
    app: CFLink;
    space: CFLink;
    stats: CFLink;
  };
}

export namespace CFProcess {
  export interface Healthcheck {
    type: string;
    data: {
      timeout?: number;
    };
  }
}

export interface CFProcessStats {
  type: CFProcessType;
  index: number;
  state: CFProcessState;
  host: string;
  uptime: number;
  mem_quota: number;
  disk_quota: number;
  fds_quota: number;
  isolation_segment?: any;
  details?: any;
  instance_ports: CFProcessStats.Instanceport[];
  usage: CFProcessStats.Usage;
}

export namespace CFProcessStats {
  export interface Usage {
    time: string;
    cpu: number;
    mem: number;
    disk: number;
  }

  export interface Instanceport {
    external: number;
    internal: number;
    external_tls_proxy_port: number;
    internal_tls_proxy_port: number;
  }
}

export type PaginatedProcessStats = CFPaginated<CFProcessStats>;
