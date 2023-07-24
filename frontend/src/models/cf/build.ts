import { CFLink, CFMetaData, CFPaginated, CFResource, CFToOneRelationship } from '@/models/cf/common';
import { CFLifecycle } from '@/models/cf/lifecycle';

export type CFBuild = CFResource & {
  state: CFBuild.State;
  staging_memory_in_mb: number;
  staging_disk_in_mb: number;
  staging_log_rate_limit_bytes_per_second: number;
  error?: string;
  lifecycle: CFLifecycle;
  package: {
    guid: string;
  };
  droplet?: {
    guid: string;
  };
  created_by: {
    guid: string;
    name: string;
    email: string;
  };
  relationships: {
    app: CFToOneRelationship;
  };
  metadata: CFMetaData;
  links: {
    self: CFLink;
    upload: CFLink;
    download: CFLink;
    app: CFLink;
  };
};

export namespace CFBuild {
  export enum State {
    STAGING = 'STAGING',
    STAGED = 'STAGED',
    FAILED = 'FAILED',
  }
}

export type PaginatedBuilds = CFPaginated<CFBuild>;
