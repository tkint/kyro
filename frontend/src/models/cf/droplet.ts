import { CFLink, CFMetaData, CFPaginated, CFResource, CFToOneRelationship } from '@/models/cf/common';
import { CFLifecycle } from '@/models/cf/lifecycle';

export type CFDroplet = CFResource & {
  state: CFDroplet.State;
  error?: string;
  execution_metadata: string;
  process_types: Record<string, string>;
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
} & (CFDroplet.Buildpack | CFDroplet.Docker);

export namespace CFDroplet {
  export enum State {
    AWAITING_UPLOAD = 'AWAITING_UPLOAD',
    PROCESSING_UPLOAD = 'PROCESSING_UPLOAD',
    STAGED = 'STAGED',
    COPYING = 'COPYING',
    FAILED = 'FAILED',
    EXPIRED = 'EXPIRED',
  }

  export type Buildpack = {
    lifecycle: CFLifecycle.Buildpack;
    checksum: {
      type: string;
      value: string;
    };
    buildpacks: Buildpack.DetectedBuildpack[];
    stack: string;
  };

  export namespace Buildpack {
    export type DetectedBuildpack = {
      name: string;
      detect_output: string;
      buildpack_name: string;
      version: string;
    };
  }

  export type Docker = {
    lifecycle: CFLifecycle.Docker;
    image: string;
  };
}

export type PaginatedDroplets = CFPaginated<CFDroplet>;
