<template>
  <!-- <div v-show=showLogin>
    <button type="button" class="btn btn-outline-secondary" v-on:click="login();">Login</button>&nbsp;
  </div> -->
<sidebar-menu
  :menu="menu"
  v-model:collapsed="collapsed"
  :theme="selectedTheme"
  @item-click="onSidebarClick"
  v-if='this.$store.getters.isLoggedIn'
>
  <template #header>
    <div class="sidebar-logo">
      <img :src="require('@/assets/logoCSI2.png')" alt="Logo" />
    </div>
  </template>
</sidebar-menu>

<!--  <sidebar-menu :menu="menu" v-model:collapsed="collapsed" :theme="selectedTheme" @item-click="onSidebarClick"/> -->
  <main class="main" :class="{'collapsed' : collapsed}" :key="$route.path">
  <router-view/>
  </main>
  <DialogsWrapper />
</template>



<script>
import { h, markRaw } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
const faIcon = (props) => {
  return {
    element: markRaw({
      render: () => h('div', [
        h(FontAwesomeIcon, { size: 'lg', ...props })
      ])
    })
  }
}
export default {
  computed: {
    showLogin: function ()
      {
        return !this.$store.getters.isLoggedIn;
      },
    menu: function () {
      console.log('menu rights patients', this.$store.getters.getRights.includes('patients'));
      var menu = [];
      menu.push(
        {
          header: 'CSI 0.1.5',
        })
      menu.push(
        {
          title: 'Settings',
          icon: faIcon({ icon: 'fa-solid fa-toolbox' }),
          child: [
            {
              title: 'Sources',
              icon: faIcon({ icon: 'fa-solid fa-file-import' }),
              child: [
                {
                  title: 'Physical Domains',
                  icon: faIcon({ icon: 'fa-solid fa-folder' }),
                  href: '/domain'
                },
                {
                  title: 'Virtual Domains',
                  icon: faIcon({ icon: 'fa-solid fa-folder-plus' }),
                  href: '/virtualdomain'
                },
                {
                  title: 'Meta Fields',
                  icon: faIcon({ icon: 'fa-solid fa-file-code' }),
                  href: '/metafield'
                },
              ]
            },
            {
              title: 'Data Fields',
              icon: faIcon({ icon: 'fa-solid fa-database' }),
              href: '/datafield'
            },
            {
              title: 'Dictionaries',
              icon: faIcon({ icon: 'fa-solid fa-list' }), 
              href: '/dictionary'
            },
            {
              title: 'Roles',
              icon: faIcon({ icon: 'fa-solid fa-user-tag' }),
              href: '/role'
            },
            {
              title: 'User Settings',
              icon: faIcon({ icon: 'fa-solid fa-users' }),
              href: '/usersetting'
            },
            {
              title: 'Help',
              icon: faIcon({ icon: 'fa-solid fa-question-circle' }),
              href: '/help'
            },
            {
              title: 'Parameters',
              icon: faIcon({ icon: 'fa-solid fa-wrench' }),
              href: '/parameter'
            },
            {
              title: 'Menu',
              icon: faIcon({ icon: 'fa-solid fa-list' }),
              href: '/menu'
            },
            {
              title: 'Domain Definition',
              icon: faIcon({ icon: 'fa-solid fa-file-import' }),
              child: [
                {
                  title: 'Definitions',
                  icon: faIcon({ icon: 'fa-solid fa-folder' }),
                  href: '/definitions'
                },
                {
                  title: 'Tables',
                  icon: faIcon({ icon: 'fa-solid fa-folder-plus' }),
                  href: '/tables'
                },
                {
                  title: 'Overview',
                  icon: faIcon({ icon: 'fa-solid fa-file-code' }),
                  href: '/domaintiming'
                },
                {
                  title: 'Source Form Group',
                  icon: faIcon({ icon: 'fa-solid fa-file-code' }),
                  href: '/sourceformgroup'
                }
              ]
            },

          ]
        }
      )
      return menu
    }
  },
  data() {
    return {
      collapsed: true
    }
  },
  methods: {
    login() {
      console.log('login');
      this.$router.push('/home');
    },
  },
  mounted() {
    console.log("app is mounted");
    var path = location.pathname;
    console.log('pathname', path);
    console.log('location', location)
    var pathArray = path.split('/');
    var namespace = 'csi'; //default namespace when app is started in development mode
    var url = '';
    //look if query params contain a namespace name for rest calls
    //http(s):// <domain> / csp / <namespace> / CSI.csp...
    //http://localhost:8080
    //http://localhost:57772/csp/nlp/CSI.csp#/Login
    //http://localhost:57772/csp/demo/CSI.csp#/Login
    //http://4.210.244.11/csp/csi/CSI.csp#/Login
    //http://spectre-hd-v01p.stluc.ucl.ac.be/iris/csp/csi/CSI.csp#/Login
    //http://ec2-35-159-97-33.eu-central-1.compute.amazonaws.com/csp/csi/CSI.csp#/Login

    if (location.host == 'localhost:8080') {
      url = '/api';
    } else {
      for (var iPath = 0; iPath < pathArray.length; iPath++) {
        if (pathArray[iPath].substring(0, 7) == 'CSI.csp') {
          namespace = pathArray[iPath - 1]
        }
      }
      url = location.protocol + '//' + location.host + '/csp/' + namespace + '/restapi';
    }
    console.log("environment", process.env.NODE_ENV)
    this.$store.dispatch('setServer',url);
    this.$store.dispatch('setSystem',namespace);
    console.log("server is set to ",url," system is ",namespace)
  }
}
</script>
<style>
.main {
    padding-top: 0px;
    padding-left: 350px;
}
.main.collapsed {
    padding-left: 70px;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

nav {
  padding: 30px;
}

nav a {
  font-weight: bold;
  color: #2c3e50;
}

nav a.router-link-exact-active {
  color: #42b983;
}

.v-sidebar-menu {
  width: 350px;
  padding-top: 40px;
  background-color: #2c3e50 !important;
}

.sidebar-logo {
  position: fixed; 
  top: 0px;
  left: 0px;
  z-index: 9999; 
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: transparent;
  padding: 0;
  width: auto;
  height: auto;
}

.sidebar-logo img {
  width: 64px;   
  height: auto;
  object-fit: contain;
  pointer-events: none;
}



</style>
