import '@mdi/font/css/materialdesignicons.css';
import '@/assets/styles.css';
import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import { createApp } from 'vue';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import 'vuetify/styles';
import App from '@/App.vue';
import { getAppInfos } from '@/api';
import router from '@/router';

const initApp = async () => {
  await getAppInfos();

  const app = createApp(App);

  const vuetify = createVuetify({
    theme: {},
    components,
    directives,
  });
  app.use(vuetify);

  const pinia = createPinia();
  pinia.use(piniaPluginPersistedstate);
  app.use(pinia);

  app.use(router);

  app.mount('#app');
};
initApp();
