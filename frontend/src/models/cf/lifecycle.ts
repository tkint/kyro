export type CFLifecycle = CFLifecycle.Buildpack | CFLifecycle.Docker | CFLifecycle.KPack;

export namespace CFLifecycle {
  export enum Type {
    BUILDPACK = 'buildpack',
    DOCKER = 'docker',
    KPACK = 'kpack',
  }

  export type Buildpack = {
    type: Type.BUILDPACK;
    data: {
      buildpacks: string[];
      stack: string;
    };
  };

  export type Docker = {
    type: Type.DOCKER;
    data: {};
  };

  export type KPack = {
    type: Type.KPACK;
    data: {
      buildpacks: string[];
    };
  };
}
