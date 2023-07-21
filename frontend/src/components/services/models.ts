import { CFServiceBinding, CFServiceInstance } from '@/models/cf/service';

export type ServiceWithBinding = CFServiceInstance & { binding: CFServiceBinding };
export type ServiceDetails = ServiceWithBinding & { details?: object };
