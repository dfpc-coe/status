import { createApp } from 'vue'
import * as VueRouter from 'vue-router'

import 'floating-vue/dist/style.css'
import FloatingVue from 'floating-vue'

import App from './App.vue'

const router = new VueRouter.createRouter({
    history: VueRouter.createWebHistory(),
    routes: [
        {
            path: '/:catchAll(.*)',
            name: 'home',
            component: () => import('./components/Home.vue')
        },
    ]
});

window.api = window.location.origin

const app = createApp(App);
app.config.devtools = true
app.use(router);
app.use(FloatingVue);
app.mount('#app');
