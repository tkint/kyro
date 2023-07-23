import { CFLink, CFMetaData, CFPaginated, CFResourceWithRelationShips, CFToOneRelationship } from '@/models/cf/common';
import { CFOrganization } from '@/models/cf/organization';
import { CFSpace } from '@/models/cf/space';

export enum CFApplicationState {
  STARTED = 'STARTED',
  STOPPED = 'STOPPED',
}

export interface CFApplication extends CFResourceWithRelationShips {
  name: string;
  state: CFApplicationState;
  lifecycle: CFApplication.Lifecycle;
  relationships: {
    space: CFToOneRelationship;
  };
  metadata: CFMetaData;
  links: {
    self: CFLink;
    environment_variables: CFLink;
    space: CFLink;
    processes: CFLink;
    packages: CFLink;
    current_droplet: CFLink;
    droplets: CFLink;
    tasks: CFLink;
    start: CFLink;
    stop: CFLink;
    revisions: CFLink;
    deployed_revisions: CFLink;
    features: CFLink;
  };
  included?: {
    spaces: CFSpace[];
    organizations: CFOrganization[];
  };
}

export type PaginatedApplications = CFPaginated<CFApplication, { spaces: CFSpace[]; organizations: CFOrganization[] }>;

export namespace CFApplication {
  export interface Lifecycle {
    type: string;
    data: Lifecycle.Data;
  }

  export namespace Lifecycle {
    export interface Data {
      buildpacks: string[];
      stack: string;
    }
  }
}
