import Vue from 'vue';
import VueRouter from 'vue-router';
import Index from './page/Index.vue';
import InterfaceMaker from './page/InterfaceMaker.vue';
import TestKeycapPage from './page/TestKeycapPage.vue';
import EditKeycapPage from './page/EditKeycap.vue';

const pageURL = 'http://localhost:3000';

const routes = [
  { path: '/index', redirect: '/'       },
  { path: '/',      component: Index    },
  { path: '/test-cap',    component: TestKeycapPage      },
  { path: '/interface/maker', component: InterfaceMaker },
  { path: '/interface/maker/:pk', component: InterfaceMaker },
  { path: '/edit-keycap', component: EditKeycapPage },
  { path: '*',      redirect: '/'       },
  { path: '*/*',    redirect: '/'       },
  { path: '*/*/*',  redirect: '/'       },
];

Vue.use(VueRouter);
const router = new VueRouter({
  routes,
  mode: 'history'
});

new Vue({
  //el: '#app',
  router,
  //render: h => h(App)
}).$mount('#app');