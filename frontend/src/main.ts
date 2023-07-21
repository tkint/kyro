import App from '@/App.vue';
import '@/assets/styles.css';
import i18n from '@/core/i18n';
import pinia from '@/core/pinia';
import router from '@/core/router';
import vuetify from '@/core/vuetify';
import { createApp } from 'vue';

const initApp = async () => {
  const app = createApp(App);

  app.use(i18n);
  app.use(pinia);
  app.use(router);
  app.use(vuetify);

  app.mount('#app');
};
initApp();
