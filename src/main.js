import { createApp } from 'vue';
import { createStore } from 'vuex';
import App from './App.vue';
import router from './router';

///https://vue3datepicker.com/
///npm install @vuepic/vue-datepicker
import Datepicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';

/// simple dialogs (e.g. to confirm a delete)
/// https://github.com/harmyderoman/vuejs-confirm-dialog & https://codesandbox.io/s/vibrant-stonebraker-ml8tms?file=/src/App.vue
import * as ConfirmDialog from 'vuejs-confirm-dialog';

///import bootstrap from 'bootstrap'
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.js";

//https://vuejsexamples.com/vue-js-toast-notification-plugin-for-vue-3/
///npm install @meforma/vue-toaster
import Toaster from '@meforma/vue-toaster';

///https://yaminncco.github.io/vue-sidebar-menu/#/
///npm i vue-sidebar-menu --save
import VueSidebarMenu from 'vue-sidebar-menu';
import 'vue-sidebar-menu/dist/vue-sidebar-menu.css';

/* import the fontawesome core */
import { library } from '@fortawesome/fontawesome-svg-core'
/* import font awesome icon component */
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
/* import specific icons */
import { faUserSecret } from '@fortawesome/free-solid-svg-icons'
import { faBicycle } from '@fortawesome/free-solid-svg-icons'
import { faPenToSquare } from '@fortawesome/free-regular-svg-icons'
import { faPlus } from '@fortawesome/free-solid-svg-icons'
import { faRotate } from '@fortawesome/free-solid-svg-icons'
import { faUser } from '@fortawesome/free-solid-svg-icons'
import { faUserCheck } from '@fortawesome/free-solid-svg-icons'
import { faUserTag } from '@fortawesome/free-solid-svg-icons'
import { faUsers } from '@fortawesome/free-solid-svg-icons'
import { faUsersRectangle } from '@fortawesome/free-solid-svg-icons'
import { faUserGroup } from '@fortawesome/free-solid-svg-icons'
import { faSort } from '@fortawesome/free-solid-svg-icons'
import { faSortUp } from '@fortawesome/free-solid-svg-icons'
import { faSortDown } from '@fortawesome/free-solid-svg-icons'
import { faUpDown } from '@fortawesome/free-solid-svg-icons'
import { faAngleLeft } from '@fortawesome/free-solid-svg-icons'
import { faAngleRight } from '@fortawesome/free-solid-svg-icons'
import { faThumbsUp } from '@fortawesome/free-regular-svg-icons'
import { faHospital } from '@fortawesome/free-solid-svg-icons'
import { faUserNurse } from '@fortawesome/free-solid-svg-icons'
import { faHouseMedical } from '@fortawesome/free-solid-svg-icons'
import { faHouseMedicalFlag } from '@fortawesome/free-solid-svg-icons'
import { faBed } from '@fortawesome/free-solid-svg-icons'
import { faDatabase } from '@fortawesome/free-solid-svg-icons'
import { faCalculator } from '@fortawesome/free-solid-svg-icons'
import { faVenusMars } from '@fortawesome/free-solid-svg-icons'
import { faEarthEurope } from '@fortawesome/free-solid-svg-icons'
import { faPeopleArrows } from '@fortawesome/free-solid-svg-icons'
import { faServer } from '@fortawesome/free-solid-svg-icons'
import { faUpload } from '@fortawesome/free-solid-svg-icons'
import { faToolbox } from '@fortawesome/free-solid-svg-icons'
import { faSliders } from '@fortawesome/free-solid-svg-icons'
import { faList } from '@fortawesome/free-solid-svg-icons'
import { faExclamation } from '@fortawesome/free-solid-svg-icons'
import { faBatteryHalf } from '@fortawesome/free-solid-svg-icons'
import { faComments } from '@fortawesome/free-solid-svg-icons'
import { faSitemap } from '@fortawesome/free-solid-svg-icons'
import { faHospitalUser } from '@fortawesome/free-solid-svg-icons'
import { faCircleExclamation } from '@fortawesome/free-solid-svg-icons'
import { faCircleQuestion } from '@fortawesome/free-solid-svg-icons'
import { faTrashCan } from '@fortawesome/free-solid-svg-icons'
import { faFileInvoiceDollar } from '@fortawesome/free-solid-svg-icons'
import { faClock } from '@fortawesome/free-solid-svg-icons'
import { faFish } from '@fortawesome/free-solid-svg-icons'
import { faHandDots } from '@fortawesome/free-solid-svg-icons'
import { faArrowsToCircle } from '@fortawesome/free-solid-svg-icons'
import { faUpRightFromSquare } from '@fortawesome/free-solid-svg-icons'
import { faFaceDizzy } from '@fortawesome/free-solid-svg-icons'
import { faBoltLightning } from '@fortawesome/free-solid-svg-icons'
import { faCheckDouble } from '@fortawesome/free-solid-svg-icons'
import { faLungsVirus } from '@fortawesome/free-solid-svg-icons'
import { faDna } from '@fortawesome/free-solid-svg-icons'
import { faSkull } from '@fortawesome/free-solid-svg-icons'
import { faLink } from '@fortawesome/free-solid-svg-icons'
import { faCircle } from '@fortawesome/free-solid-svg-icons'
import { faGaugeHigh } from '@fortawesome/free-solid-svg-icons'
import { faPlay } from '@fortawesome/free-solid-svg-icons'
import { faStop } from '@fortawesome/free-solid-svg-icons'
import { faWrench } from '@fortawesome/free-solid-svg-icons'

/* add icons to the library */
library.add(faUserSecret, faBicycle, faPenToSquare, faPlus, faRotate, faUser, faUsers, faUsersRectangle, faUserGroup, faSort, faSortUp, faSortDown, faUpDown, faAngleLeft, faAngleRight, faThumbsUp,
    faHospital, faUserNurse, faHouseMedical, faHouseMedicalFlag, faBed, faDatabase, faCalculator, faVenusMars, faEarthEurope, faPeopleArrows, faServer, faUpload, faToolbox,
    faSliders, faList, faExclamation, faBatteryHalf, faComments, faSitemap, faHospitalUser, faUserCheck, faUserTag, faCircleExclamation, faCircleQuestion, faTrashCan, faFileInvoiceDollar, faClock,
    faFish, faHandDots, faArrowsToCircle, faUpRightFromSquare, faCheckDouble, faFaceDizzy, faBoltLightning, faLungsVirus, faDna, faSkull, faLink, faCircle, faGaugeHigh, faPlay, faStop, faWrench)

const store = createStore({
    state() {
        return {
            userName: '',
            accessToken: '',
            refreshToken: '',
            server: '',
            userAccessCode: '',
            accessTokenExpiresAt: '',
            refreshTokenExpiresAt: '',
            appContext: {},
            appName: 'useradminapp',
            pageContext: { 'filter': '' },
            rights: [],
            system: ''
        };
    },
    mutations: {
        connectToServer(state, url) { //call this from any component with this.$store.commit('connectToServer','http://localhost:57772/api/danny')
            state.server = url;
        },
        connectToSystem(state, system) {
            state.system = system;
        },
        userName(state, userName) {
          state.userName = userName;
        },
        userAccessCode(state, userAccessCode) {
          state.userAccessCode = userAccessCode;
        },
        accessToken(state, accessToken) {  //call this from any component with this.$store.commit('accessToken')
            state.accessToken = accessToken;
        },
        refreshToken(state, refreshToken) {  //call this from any component with this.$store.commit('refreshToken')
            state.refreshToken = refreshToken;
        },
        accessTokenExpiresAt(state, accessTokenExpiresAt) {  //call this from any component with this.$store.commit('accessTokenExpiresAt')
            state.accessTokenExpiresAt = accessTokenExpiresAt;
        },
        refreshTokenExpiresAt(state, refreshTokenExpiresAt) {  //call this from any component with this.$store.commit('refreshTokenExpiresAt')
            state.refreshTokenExpiresAt = refreshTokenExpiresAt;
        },
        setPageContext(state, pageContext) {  //call this from any component with this.$store.commit('setPageContext')  
            state.pageContext = pageContext;
        },
        rights(state, right) {
            state.rights.push(right);
        }
    },
    actions: {
        saveToken(context, payload) {  //call this with this.$store.dispatch('saveToken')
            context.commit('userName', payload.user);
            context.commit('userAccessCode', payload.userAccessCode);
            context.commit('accessToken', payload.accessToken);
            context.commit('refreshToken', payload.refreshToken);
            context.commit('accessTokenExpiresAt', payload.accessTokenExpiresAt);
            context.commit('refreshTokenExpiresAt', payload.refreshTokenExpiresAt);
        },
        refreshToken(context, payload) {
           context.commit('accessToken', payload.accessToken)
           context.commit('accessTokenExpiresAt', payload.accessTokenExpiresAt);
        },
        logOut(context) {
            context.commit('userName', '');
            context.commit('accessToken', '');
            context.commit('refreshToken', '');
        },
        setServer(context, url, system) {
            context.commit('connectToServer', url, system);
        },
        setSystem(context, system) {
            context.commit('connectToSystem', system);
        },
        setRights(context, right) {
            context.commit('rights', right)
        }
    },
    getters: {
        serverUrl(state) {   //this.$store.getters.serverUrl
            return state.server;
        },
        system(state) {
            return state.system;
        },
        serverAccessToken(state) {
            return state.accessToken
        },
        serverAccessTokenExpiresAt(state) {
            return state.accessTokenExpiresAt
        },
        serverRefreshToken(state) {
            return state.refreshToken
        },
        isLoggedIn(state) {
            return (state.accessToken!=='')
        },
        user(state) {
            return (state.userName)
        },
        userAccessCode(state) {
            return (state.userAccessCode)
        },
        appName(state) {  //this.$store.getters.appName
            return (state.appName)
        },
        getPageContext(state) { ////this.$store.getters.pageContext
            return (state.pageContext);
        },
        getRights(state) {
            return (state.rights)
        }
    }
});

/// createApp(App).use(router).mount('#app')
const app = createApp(App);
app.component('font-awesome-icon', FontAwesomeIcon)
app.component('vue-Datepicker', Datepicker);
app.use(router);
app.use(store);
app.use(Toaster);
app.use(VueSidebarMenu);
app.use(ConfirmDialog);
app.mount('#app');

