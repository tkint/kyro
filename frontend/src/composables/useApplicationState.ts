import { ApiErrorResponse } from '@/api';
import applicationApi from '@/api/application';
import buildApi from '@/api/build';
import dropletApi from '@/api/droplet';
import processApi from '@/api/process';
import { CFApplication, CFApplicationState } from '@/models/cf/application';
import { CFBuild } from '@/models/cf/build';
import { CFDroplet } from '@/models/cf/droplet';
import { CFProcessState, ProcessStatsResources } from '@/models/cf/process';
import { Result } from '@/utils/result';
import { computed, ref, unref } from 'vue';

export type ApplicationState =
  | {
      state: 'unknown';
    }
  | {
      state: 'started';
      processes: Result<ProcessStatsResources, ApiErrorResponse>;
    }
  | {
      state: 'starting';
      processes: Result<ProcessStatsResources, ApiErrorResponse>;
    }
  | {
      state: 'stopped';
      processes: Result<ProcessStatsResources, ApiErrorResponse>;
    }
  | {
      state: 'building';
      processes: Result<ProcessStatsResources, ApiErrorResponse>;
      buildGuid: CFBuild['guid'];
    }
  | {
      state: 'deprecated-droplet';
      processes: Result<ProcessStatsResources, ApiErrorResponse>;
      dropletGuid: CFDroplet['guid'];
    };

type WatcherOptions = {
  guid: CFApplication['guid'];
  interval?: number;
};

export default () => {
  const currentState = async (guid: CFApplication['guid']): Promise<ApplicationState> => {
    const application = await applicationApi.getOne(guid);

    if (!application.success) return { state: 'unknown' };

    const processes = await processApi.getStatsForApplication(guid, 'web');

    if (application.data.state === CFApplicationState.STOPPED) {
      return { state: 'stopped', processes };
    }

    if (processes.success) {
      if (processes.data.resources.some(({ state }) => state == CFProcessState.STARTING)) {
        return { state: 'starting', processes };
      }
    }

    const stagingBuild = await buildApi.listForApplication(guid, { states: [CFBuild.State.STAGING], perPage: 1 });

    if (stagingBuild.success) {
      if (stagingBuild.data.resources.length > 0) {
        return { state: 'building', processes, buildGuid: stagingBuild.data.resources[0].guid };
      }

      const [stagedBuild, droplets] = await Promise.all([
        buildApi.listForApplication(guid, {
          states: [CFBuild.State.STAGED],
          page: 1,
          perPage: 1,
          orderBy: '-created_at',
        }),
        dropletApi.listForApplication(guid, { current: true }),
      ]);

      if (stagedBuild.success && droplets.success) {
        const lastBuild = stagedBuild.data.resources[0];
        const currentDroplet = droplets.data.resources[0];

        if (lastBuild.droplet && lastBuild.droplet.guid !== currentDroplet?.guid) {
          return { state: 'deprecated-droplet', processes, dropletGuid: lastBuild.droplet.guid };
        }
      }
    }

    return { state: 'started', processes };
  };

  const watchState = (
    options: WatcherOptions & {
      lazy?: boolean;
    },
  ) => {
    const actualOptions = ref(options);

    const initialState: ApplicationState = { state: 'unknown' };
    const state = ref<ApplicationState>(initialState);
    const refreshState = async (guid: CFApplication['guid']) => {
      state.value = await currentState(guid);
    };

    const watcher = ref<number>();

    /**
     *
     * @param options
     */
    const start = (options?: Partial<{ resetState: boolean; eager: boolean }>) => {
      stop();

      const { guid, interval = 5000 } = unref(actualOptions);

      if (options?.resetState) {
        state.value = initialState;
      }

      if (options?.eager) {
        refreshState(guid);
      }

      watcher.value = setInterval(() => {
        refreshState(guid);
      }, interval);
    };

    const stop = () => {
      clearInterval(watcher.value);
      watcher.value = undefined;
    };

    return {
      state,
      active: computed(() => watcher.value !== undefined),
      start,
      stop,
      reset: () => (state.value = initialState),
      refresh: () => refreshState(actualOptions.value.guid),
      update: (newOptions: Partial<WatcherOptions>) => {
        actualOptions.value = {
          ...actualOptions.value,
          ...newOptions,
        };
      },
    };
  };

  return {
    watchState,
    currentState,
  };
};
