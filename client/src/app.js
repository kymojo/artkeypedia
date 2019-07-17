import Vue from 'vue';
import VueRouter from 'vue-router';
import App from './App.vue';
import Foo from './Foo.vue';

const routes = [
  { path: '/',      redirect: '/index'},
  { path: '/index', component: App},
  { path: '/foo',   component: Foo},
  { path: '*',      redirect: '/index' },
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