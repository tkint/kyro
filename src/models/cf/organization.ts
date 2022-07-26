import { CFLink, CFMetaData, CFResourceWithRelationShips, CFPaginated, CFToOneRelationship } from '@/models/cf/common';

export interface CFOrganization extends CFResourceWithRelationShips {
  name: string;
  suspended: boolean;
  relationships: {
    quota: CFToOneRelationship;
  };
  metadata: CFMetaData;
  links: {
    self: CFLink;
  };
}

export type PaginatedOrganizations = CFPaginated<CFOrganization>;
