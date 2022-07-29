import { CFLink, CFMetaData, CFResource, CFResourceWithRelationShips } from '@/models/cf/common';

export interface CFUser extends CFResource {
  username: string;
  presentation_name: string;
  origin: string;
  metadata: CFMetaData;
  links: {
    self: CFLink;
  };
}
