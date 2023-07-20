import { CFLink, CFMetaData, CFPaginated, CFResourceWithRelationShips, CFToOneRelationship } from '@/models/cf/common';

export interface CFRoute extends CFResourceWithRelationShips {
  protocol: CFRoute.Protocol;
  host: string;
  path: string;
  port: number | null;
  url: string;
  destinations: CFRoute.Destination[];
  relationships: {
    space: CFToOneRelationship;
    domain: CFToOneRelationship;
  };
  metadata: CFMetaData;
  links: {
    self: CFLink;
    space: CFLink;
    destinations: CFLink;
    domain: CFLink;
  };
}

export namespace CFRoute {
  export enum Protocol {
    HTTP = 'http',
    TCP = 'tcp',
  }

  export interface Destination {
    guid: string;
    app: Destination.App;
    port: number;
    weight: number | null;
    protocol: Destination.Protocol | null;
  }

  export namespace Destination {
    export enum Protocol {
      HTTP1 = 'http1',
      HTTP2 = 'http2',
      TCP = 'tcp',
    }

    export interface App {
      guid: string;
      process: App.Process;
    }

    export namespace App {
      export interface Process {
        type: string;
      }
    }
  }
}

export type PaginatedRoutes = CFPaginated<CFRoute>;
