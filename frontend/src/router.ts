import { ref } from 'vue';
import { createRouter, createWebHashHistory } from 'vue-router';

export enum RouteNames {
  HOME = 'HOME',
  APPLICATION = 'APPLICATION',
  APPLICATION_ENVIRONMENT = 'APPLICATION_ENVIRONMENT',
  APPLICATION_SERVICES = 'APPLICATION_SERVICES',
  APPLICATION_LOG_STREAM = 'APPLICATION_LOG_STREAM',
  APPLICATIONS = 'APPLICATIONS',
  ORGANIZATION = 'ORGANIZATION',
  ORGANIZATIONS = 'ORGANIZATIONS',
  SPACE = 'SPACE',
  SPACES = 'SPACES',
  NOT_FOUND = 'NOT_FOUND',
}

export const componentNameFor = (route: RouteNames) => `${route}_VIEW`;

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      name: RouteNames.HOME,
      path: '',
      redirect: { name: RouteNames.APPLICATIONS },
    },

    {
      path: '/application/:guid',
      component: () => import('@/views/ApplicationView.vue'),
      props: true,
      children: [
        {
          name: RouteNames.APPLICATION,
          path: '',
          component: () => import('@/components/application/ApplicationDashboard.vue'),
        },
        {
          name: RouteNames.APPLICATION_ENVIRONMENT,
          path: 'environment',
          component: () => import('@/components/environment/EnvironmentDashboard.vue'),
        },
        {
          name: RouteNames.APPLICATION_SERVICES,
          path: 'services',
          component: () => import('@/components/services/ServicesDashboard.vue'),
        },
        {
          name: RouteNames.APPLICATION_LOG_STREAM,
          path: 'logs',
          component: () => import('@/components/logstream/LogStreamDashboard.vue'),
        },
      ],
    },
    {
      name: RouteNames.APPLICATIONS,
      path: '/applications',
      component: () => import('@/views/ApplicationsView.vue'),
    },

    {
      name: RouteNames.ORGANIZATION,
      path: '/organization/:guid',
      component: () => import('@/views/OrganizationView.vue'),
      props: true,
    },
    {
      name: RouteNames.ORGANIZATIONS,
      path: '/organizations',
      component: () => import('@/views/OrganizationsView.vue'),
    },

    {
      name: RouteNames.SPACE,
      path: '/space/:guid',
      component: () => import('@/views/SpaceView.vue'),
      props: true,
    },
    {
      name: RouteNames.SPACES,
      path: '/spaces',
      component: () => import('@/views/SpaceView.vue'),
    },

    {
      name: RouteNames.NOT_FOUND,
      path: '/:pathMatch(.*)*',
      component: () => import('@/views/NotFoundView.vue'),
      props: true,
    },
  ],
});

export const previousRoute = ref<RouteNames>();
router.beforeEach((_, from) => {
  if (!!from.name && from.name in RouteNames) {
    previousRoute.value = from.name as RouteNames;
  }
});

export default router;
