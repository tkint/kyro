import { ref } from 'vue';
import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import Home from '@/views/HomeView.vue';

export enum RouteNames {
  HOME = 'HOME',
  APPLICATION = 'APPLICATION',
  APPLICATIONS = 'APPLICATIONS',
  ORGANIZATION = 'ORGANIZATION',
  ORGANIZATIONS = 'ORGANIZATIONS',
  SPACE = 'SPACE',
  SPACES = 'SPACES',
}

export const componentNameFor = (route: RouteNames) => `${route}_VIEW`;

export const routes: Record<RouteNames, RouteRecordRaw> = {
  [RouteNames.HOME]: { path: '', component: Home },

  [RouteNames.APPLICATION]: {
    path: '/application/:guid',
    component: () => import('@/views/ApplicationView.vue'),
    props: true,
  },
  [RouteNames.APPLICATIONS]: {
    path: '/applications',
    component: () => import('@/views/ApplicationsView.vue'),
  },

  [RouteNames.ORGANIZATION]: {
    path: '/organization/:guid',
    component: () => import('@/views/OrganizationView.vue'),
    props: true,
  },
  [RouteNames.ORGANIZATIONS]: {
    path: '/organizations',
    component: () => import('@/views/OrganizationsView.vue'),
  },

  [RouteNames.SPACE]: {
    path: '/space/:guid',
    component: () => import('@/views/SpaceView.vue'),
    props: true,
  },
  [RouteNames.SPACES]: {
    path: '/spaces',
    component: () => import('@/views/SpaceView.vue'),
  },
};

const router = createRouter({
  history: createWebHistory(),
  routes: Object.entries(routes).map(([name, route]) => ({ ...route, name })),
});

export const previousRoute = ref<RouteNames>();
router.beforeEach((_, from) => {
  if (!!from.name && from.name in RouteNames) {
    previousRoute.value = from.name as RouteNames;
  }
});

export default router;
