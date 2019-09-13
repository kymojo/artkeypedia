import Vue from 'vue';
import VueRouter from 'vue-router';
import Index from './page/Index.vue';
import Foo from './page/Foo.vue';
import Cap from './page/Cap.vue';
import InterfaceMenu from './page/InterfaceMenu.vue';
import InterfaceKeycap from './page/InterfaceKeycap.vue';
import InterfaceMaker from './page/InterfaceMaker.vue';

const pageURL = 'http://localhost:3000';

const routes = [
  { path: '/index', redirect: '/'       },
  { path: '/',      component: Index    },
  { path: '/foo',   component: Foo      },
  { path: '/cap',   component: Cap      },
  { path: '/interface',        component: InterfaceMenu   },
  { path: '/interface/keycap', component: InterfaceKeycap },
  { path: '/interface/maker', component: InterfaceMaker },
  { path: '/interface/maker/:pk', component: InterfaceMaker },
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