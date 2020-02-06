import VueRouter from "vue-router";
import Vue from 'vue';

import Game from "./views/Game.vue";
import Lobbies from "./views/Lobbies.vue";

Vue.use(VueRouter);

export default new VueRouter({
  routes: [
    {
      path: "/",
      name: "lobbies",
      component: Lobbies,
      meta: {
       title: 'Battleship',
       isBigHeader: true,
      }
    },
    {
      path: "/game",
      name: "game",
      component: Game,
      meta: {
       title: 'Place your ships',
       isBigHeader: false,
      }
    }
  ]
});