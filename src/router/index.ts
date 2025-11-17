import { createRouter, createWebHistory } from 'vue-router';
import GamePage from '../page/game-page.vue';
import HomePage from '../page/home-page.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomePage,
  },
  {
    path: '/game/:speed',
    name: 'Game',
    component: GamePage,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
