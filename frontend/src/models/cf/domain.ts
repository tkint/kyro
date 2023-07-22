import {
  CFLink,
  CFMetaData,
  CFPaginated,
  CFResource,
  CFToManyRelationship,
  CFToOneRelationship,
} from '@/models/cf/common';

export interface CFDomain extends CFResource {
  name: string;
  internal: boolean;
  router_group?: {
    guid: string;
  };
  supported_protocols: CFDomain.Protocol[];
  relationships: {
    organization: CFToOneRelationship;
    shared_organizations: CFToManyRelationship;
  };
  metadata: CFMetaData;
  links: {
    self: CFLink;
    route_reservations: CFLink;
  };
}

export namespace CFDomain {
  export enum Protocol {
    HTTP = 'http',
    TCP = 'tcp',
  }
}

export type PaginatedDomains = CFPaginated<CFDomain>;
