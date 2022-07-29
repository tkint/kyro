export interface CFEnvironmentVariables {
  staging_env_json: Record<string, any>;
  running_env_json: Record<string, any>;
  environment_variables: Record<string, any>;
  system_env_json: Record<string, any> & {
    VCAP_SERVICES: CFEnvironmentVariables.VCAPServices;
  };
  application_env_json: Record<string, any> & {
    VCAP_APPLICATION: CFEnvironmentVariables.VCAPApplication;
  };
}

export namespace CFEnvironmentVariables {
  export interface VCAPServices extends Record<string, any> {}

  export interface VCAPApplication extends Record<string, any> {}
}
