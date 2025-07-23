import { createRouter, createWebHashHistory } from 'vue-router';
import Login from '../views/Login.vue'
import Contract from '../views/Contract.vue'
import CTP from '../views/CTP.vue'
import Home from '../views/Home.vue'
import About from '../views/About.vue'
import TauriTest from '../views/TauriTest.vue'
import TauriDebug from '../views/TauriDebug.vue'
import Screenshot from '../views/Screenshot.vue'
import TradingPanel from '../views/TradingPanel.vue'
import TradingController from '../views/TradingController.vue'
import PriceBoard from '../views/PriceBoard.vue'
import CtpTest from '../views/CtpTest.vue'
import ServerConfig from '../views/ServerConfig.vue'
import ContractSearch from '../views/ContractSearch.vue'

const routes = [
    { path: '/', name: 'Index', component: Home },
    { path: '/home', name: 'Home', component: Home },
    { path: '/login', name: 'Login', component: Login },
    { path: '/contract', name: 'Contract', component: Contract },
    { path: '/ctp', name: 'CTP', component: CTP },
    { path: '/ctp-test', name: 'CtpTest', component: CtpTest },
    { path: '/about', name: 'About', component: About },
    { path: '/tauri-test', name: 'TauriTest', component: TauriTest },
    { path: '/tauri-debug', name: 'TauriDebug', component: TauriDebug },
    { path: '/screenshot', name: 'Screenshot', component: Screenshot },
    { path: '/trading-panel', name: 'TradingPanelAlt', component: TradingPanel },
    { path: '/trading-controller', name: 'TradingController', component: TradingController },
    { path: '/price-board', name: 'PriceBoard', component: PriceBoard },
    { path: '/server-config', name: 'ServerConfig', component: ServerConfig },
    { path: '/contract-search', name: 'ContractSearch', component: ContractSearch },
]

const router = createRouter({
    history: createWebHashHistory(),
    routes
})

export default router