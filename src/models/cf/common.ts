import { Dayjs } from 'dayjs';
import { HttpMethod } from '@/models/common';

export interface CFLink {
  href: string;
  method: HttpMethod;
}

export interface CFRelationship {}

export interface CFToOneRelationship extends CFRelationship {
  data: {
    guid: string;
  };
}

export interface CFMetaData {
  labels: Record<string, any>;
  annotations: Record<string, any>;
}

export interface CFResource {
  guid: string;
  created_at: Dayjs;
  updated_at: Dayjs;
  links: Record<string, CFLink>;
}

export interface CFResourceWithRelationShips extends CFResource {
  relationships: Record<string, CFRelationship>;
  included?: Record<string, CFResource[]>;
}

export interface Paginated<TObject extends CFResource> {
  pagination: Paginated.Pagination;
  resources: TObject[];
}

export namespace Paginated {
  export interface Pagination {
    total_results: number;
    total_pages: number;
    first?: CFLink;
    last?: CFLink;
    next?: CFLink;
    previous?: CFLink;
  }
}
