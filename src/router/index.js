import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/Home.vue'
import LoginForm from '../views/LoginFrm.vue'
import MenuGrid from '../views/MenuGrid.vue'
import ParameterGrid from '../views/ParameterGrid.vue'
import ParameterForm from '../views/ParameterFrm.vue'

const routes = [
  { path: '/',  name: 'home',  component: HomeView },
  { path: '/about', name: 'about', component: () => import(/* webpackChunkName: "about" */ '../views/AboutView.vue') },
  { path: '/login', name: 'FrmLogin', component: LoginForm },
  { path: '/menu',  name: 'MenuGrid', component: MenuGrid },
  { path: '/parameter',  name: 'ParameterGrid', component: ParameterGrid },
  { path: '/parameter/:id',  name: 'ParameterFrm', component: ParameterForm }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
