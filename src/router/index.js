import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/Home.vue'
import LoginForm from '../views/LoginFrm.vue'
import MenuGrid from '../views/MenuGrid.vue'
import ParameterGrid from '../views/ParameterGrid.vue'
import ParameterForm from '../views/ParameterFrm.vue'
import MetaFieldGrid from '../views/MetaFieldGrid.vue'
import MetaFieldForm from '../views/MetaFieldsFrm.vue'
import DataFieldGrid from '../views/DataFieldGrid.vue'
import DataFieldForm from '../views/DataFieldFrm.vue'
import HelpGrid from '../views/HelpGrid.vue'
import HelpForm from '../views/HelpFrm.vue'
import UserSettingGrid from '../views/UserSettingsGrid.vue'
import UserSettingForm from '../views/UserSettingsFrm.vue'
import RoleGrid from '../views/RoleGrid.vue'
import RoleForm from '../views/RoleFrm.vue'
import DomainGrid from '../views/DomainGrid.vue'
import DomainForm from '../views/DomainFrm.vue'
import VirtualDomainGrid from '../views/VirtualDomainGrid.vue'
import VirtualDomainForm from '../views/VirtualDomainFrm.vue'
import DictionaryDefinitionGrid from '../views/DictionaryDefinitionGrid.vue'
import DictionaryDefinitionForm from '../views/DictionaryDefinitionFrm.vue'

const routes = [
  { path: '/',  name: 'home',  component: HomeView },
  { path: '/about', name: 'about', component: () => import(/* webpackChunkName: "about" */ '../views/AboutView.vue') },
  { path: '/login', name: 'FrmLogin', component: LoginForm },
  { path: '/menu',  name: 'MenuGrid', component: MenuGrid },
  { path: '/parameter',  name: 'ParameterGrid', component: ParameterGrid },
  { path: '/parameter/:id',  name: 'ParameterFrm', component: ParameterForm },
  { path: '/metafield',  name: 'MetaFieldGrid', component: MetaFieldGrid },
  { path: '/metafield/:id',  name: 'MetaFieldForm', component: MetaFieldForm },
  { path: '/datafield',  name: 'DataFieldGrid', component: DataFieldGrid },
  { path: '/datafield/:id',  name: 'DataFieldForm', component: DataFieldForm },
  { path: '/help',  name: 'HelpGrid', component: HelpGrid },
  { path: '/help/:id',  name: 'HelpForm', component: HelpForm },
  { path: '/usersetting',  name: 'UserSettingGrid', component: UserSettingGrid},
  { path: '/usersetting/:id',  name: 'UserSetiingForm', component: UserSettingForm},
  { path: '/role',  name: 'RoleGrid', component: RoleGrid},
  { path: '/role/:id',  name: 'RoleForm', component: RoleForm},
  { path: '/domain',  name: 'DomainGrid', component: DomainGrid},
  { path: '/domain/:id',  name: 'DomainForm', component: DomainForm},
  { path: '/virtualdomain',  name: 'VirtualDomainGrid', component: VirtualDomainGrid},
  { path: '/virtualdomain/:id',  name: 'VirtualDomainForm', component: VirtualDomainForm},
  { path: '/dictionary',  name: 'DictionaryDefinitionGrid', component: DictionaryDefinitionGrid},
  { path: '/dictionary/:id',  name: 'DictionaryDefinitionForm', component: DictionaryDefinitionForm},


]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
