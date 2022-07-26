import { CFLink, CFMetaData, CFResourceWithRelationShips, Paginated as CFPaginated } from '@/models/cf/common';

export type CFProcessType = 'web';

export interface CFProcess extends CFResourceWithRelationShips {
  name: string;
  type: CFProcessType;
  relationships: {};
  metadata: CFMetaData;
  links: {
    self: CFLink;
  };
}

export type PaginatedProcesses = CFPaginated<CFProcess>;
