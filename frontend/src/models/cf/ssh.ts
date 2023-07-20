import { CFLink, CFMetaData, CFPaginated, CFResource, CFToOneRelationship } from '@/models/cf/common';

export interface CFSSHEnabled {
  enabled: boolean;
  reason: string;
}
