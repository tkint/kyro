import { HttpMethod } from '@/models/common';
import { Dayjs } from 'dayjs';

export interface CFLink {
  href: string;
  method: HttpMethod;
}

export enum CFInclude {
  USER = 'user',
  SPACE = 'space',
  SPACE_ORGANIZATION = 'space.organization',
  ORG = 'org',
  ORGANIZATION = 'organization',
  DOMAIN = 'domain',
  SERVICE_INSTANCE = 'service_instance',
  SERVICE_OFFERING = 'service_offering',
  ROUTE = 'route',
}

export interface CFRelationship {}

export interface CFToOneRelationship extends CFRelationship {
  data: {
    guid: string;
  };
}

export interface CFToManyRelationship extends CFRelationship {
  data: { guid: string }[];
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

export interface CFPaginated<TObject> {
  pagination: CFPaginated.Pagination;
  resources: Omit<TObject, 'included'>[];
  included?: Record<string, CFResource[]>;
}

export namespace CFPaginated {
  export interface Pagination {
    total_results: number;
    total_pages: number;
    first?: CFLink;
    last?: CFLink;
    next?: CFLink;
    previous?: CFLink;
  }
}

export const mapResources = <TObject, TNewObject>(
  paginated: CFPaginated<TObject>,
  predicate: (obj: Omit<TObject, 'included'>) => TNewObject,
): CFPaginated<TNewObject> => ({
  ...paginated,
  resources: paginated.resources.map((obj) => predicate(obj)),
});
