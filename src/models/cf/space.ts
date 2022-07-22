import { CFLink, CFMetaData, CFResourceWithRelationShips, CFToOneRelationship } from '@/models/cf/common';

export interface CFSpace extends CFResourceWithRelationShips {
  name: string;

  relationships: {
    space: CFToOneRelationship;
  };
  metadata: CFMetaData;
  links: {
    self: CFLink;
  };
}
