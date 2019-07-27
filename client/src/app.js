import Vue from 'vue';
import VueRouter from 'vue-router';
import Index from './page/Index.vue';
import Foo from './page/Foo.vue';
import Cap from './page/Cap.vue';

const pageURL = 'http://localhost:3000';

const routes = [
  { path: '/index', redirect: '/'       },
  { path: '/',      component: Index    },
  { path: '/foo',   component: Foo      },
  { path: '/cap',   component: Cap      },
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