import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/Home.vue'
import FrmLogin from '../views/LoginFrm.vue'
import MenuGrid from '../views/MenuGrid.vue'
import ParameterGrid from '../views/ParameterGrid.vue'

const routes = [
  { path: '/',  name: 'home',  component: HomeView },
  { path: '/about', name: 'about', component: () => import(/* webpackChunkName: "about" */ '../views/AboutView.vue') },
  { path: '/login', name: 'FrmLogin', component: FrmLogin },
  { path: '/menu',  name: 'MenuGrid', component: MenuGrid },
  { path: '/parameter',  name: 'ParameterGrid', component: ParameterGrid }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
