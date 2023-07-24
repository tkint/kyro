import { CFLink, CFMetaData, CFPaginated, CFResource, CFToOneRelationship } from '@/models/cf/common';

export type CFPackage = CFResource & {
  state: CFPackage.State;
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
} & (CFPackage.Bits | CFPackage.Docker);

export namespace CFPackage {
  export enum Type {
    BITS = 'bits',
    DOCKER = 'docker',
  }

  export enum State {
    AWAITING_UPLOAD = 'AWAITING_UPLOAD',
    PROCESSING_UPLOAD = 'PROCESSING_UPLOAD',
    READY = 'READY',
    FAILED = 'FAILED',
    COPYING = 'COPYING',
    EXPIRED = 'EXPIRED',
  }

  export type Bits = {
    type: CFPackage.Type.BITS;
    data: {
      error?: string;
      checksum: {
        type: string;
        value?: string;
      };
    };
  };

  export type Docker = {
    type: CFPackage.Type.DOCKER;
    data: {
      image: string;
      username: string;
      password: string;
    };
  };
}

export type PaginatedPackages = CFPaginated<CFPackage>;
