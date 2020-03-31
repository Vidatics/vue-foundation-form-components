import Vue from 'vue';

import App from './Demo.vue';


import './styles/style.scss';
import '@fortawesome/fontawesome-free/css/all.css';

Vue.config.productionTip = false;

new Vue({
	render: (h) => h(App),
}).$mount('#app');
