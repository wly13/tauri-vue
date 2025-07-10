import { createRouter, createWebHashHistory } from 'vue-router';
import Login from '../views/Login.vue'
import Contract from '../views/Contract.vue'

const routes = [
    { path: '/', name: 'Login', component: Login },
    { path: '/contract', name: 'Contract', component: Contract },
]

const router = createRouter({
    history: createWebHashHistory(),
    routes
})

export default router