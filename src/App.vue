<template>
  <div v-show=showLogin>
    <button type="button" class="btn btn-outline-secondary" v-on:click="login();">Login</button>&nbsp;
  </div>
  <sidebar-menu v-if='this.$store.getters.isLoggedIn' :menu="menu" v-model:collapsed="collapsed" :theme="selectedTheme" @item-click="onSidebarClick"/>
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
    console.log('location',location)
    var pathArray = path.split('/');
    var namespace = 'csi' //default namespace when app is started in development mode
    //look if query params contain a namespace name for rest calls
    var searchArray = location.search.split('&')
    for (var iSearch = 0; iSearch < searchArray.length; iSearch++) {
      if ((searchArray[iSearch].substring(0, 3) == 'ns=') || (searchArray[iSearch].substring(0, 4) == '?ns=')) {
        namespace = searchArray[iSearch].split('=')[1]
        console.log('switch rest to ',namespace)
      }
    }
    for (var i=0;i<pathArray.length;i++) {
      if (pathArray[i].substring(0,6)=='uzgent') {  //development local server Ivan
        namespace = pathArray[i].substring(0,6);
        break;
      }
      if (pathArray[i].substring(0,5)=='winfo') {  //development local server Danny
        namespace = pathArray[i].substring(0,5);
        break;
      }
    }

    var protocol = 'http';
    var port = '';
    var domain = document.domain;
    var uri = '';
    if ((namespace == 'uzgent') || (namespace == 'winfo') || (namespace == 'csi') || (namespace == 'demo')) {  //connect to localhost for local development server
      protocol = 'http';
      port = 57772;
      domain = 'localhost';
      uri = '/csp/'+namespace+'/'
    }
    ///var url = location.protocol+"//"+document.domain+":"+port+"/api/clinicom/"+namespace
    var url = protocol + '://' + domain + ":" + port + uri + "restapi/csi"
    console.log("environment",process.env.NODE_ENV)
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
}
</style>
