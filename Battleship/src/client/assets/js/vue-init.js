import Vue from 'vue';

import App from './App';
import router from "./router";

import './vendor/argon/initArgon';

import Overdrive from 'vue-overdrive'
Vue.use(Overdrive)


export default new Vue({
    el: '#app',
    router,
    render: h => h(App),
});
