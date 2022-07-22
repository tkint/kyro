import { CFLink, CFMetaData, CFResourceWithRelationShips } from '@/models/cf/common';

export interface CFOrganization extends CFResourceWithRelationShips {
  name: string;
  relationships: {};
  metadata: CFMetaData;
  links: {
    self: CFLink;
  };
}
