import { ref } from 'vue';
import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import Home from '@/views/HomeView.vue';

export enum RouteNames {
  HOME = 'HOME',
  APPLICATIONS = 'APPLICATIONS',
  APPLICATION = 'APPLICATION',
  ORGANIZATION = 'ORGANIZATION',
  SPACE = 'SPACE',
}

export const componentNameFor = (route: RouteNames) => `${route}_VIEW`;

export const routes: Record<RouteNames, RouteRecordRaw> = {
  [RouteNames.HOME]: { path: '', component: Home },
  [RouteNames.APPLICATIONS]: {
    path: '/applications',
    component: () => import('@/views/ApplicationsView.vue'),
  },
  [RouteNames.APPLICATION]: {
    path: '/application/:guid',
    component: () => import('@/views/ApplicationView.vue'),
    props: true,
  },
  [RouteNames.ORGANIZATION]: {
    path: '/organization/:guid',
    component: () => import('@/views/OrganizationView.vue'),
    props: true,
  },
  [RouteNames.SPACE]: {
    path: '/space/:guid',
    component: () => import('@/views/SpaceView.vue'),
    props: true,
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
