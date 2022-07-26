import { CFLink, CFMetaData, CFPaginated, CFResourceWithRelationShips, CFToOneRelationship } from '@/models/cf/common';

export interface CFSpace extends CFResourceWithRelationShips {
  name: string;

  relationships: {
    organization: CFToOneRelationship;
  };
  metadata: CFMetaData;
  links: {
    self: CFLink;
  };
}

export type PaginatedSpaces = CFPaginated<CFSpace>;
