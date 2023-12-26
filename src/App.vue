<template>
  <!--<sidebar-menu v-if='this.$store.getters.isLoggedIn' :menu="menu" v-model:collapsed="collapsed" :theme="selectedTheme" @item-click="onSidebarClick"/>-->
  <sidebar-menu :menu="menu" v-model:collapsed="collapsed" :theme="selectedTheme" @item-click="onSidebarClick"/>
  <main class="main" :class="{'collapsed' : collapsed}" :key="$route.path">
  <router-view/>
  </main>
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
    menu: function () {
      console.log('menu rights patients', this.$store.getters.getRights.includes('patients'));
      var menu = [];
      menu.push(
        {
          header: 'CSI',
        })
      menu.push(
        {
          title: 'Ziekenhuis',
          icon: faIcon({ icon: 'fa-solid fa-hospital' }),
          child: [
            {
              title: 'Zorgverleners',
              icon: faIcon({ icon: 'fa-solid fa-user-nurse' }),
              href: '/caregivers/maintenance'
            }
          ]
        }
      )
      return menu
    }
  },
  methods: {

  },
  mounted() {
    console.log("app is mounted");
    var path = location.pathname;
    console.log('pathname', path);
    console.log('location',location)
    var pathArray = path.split('/');
    var namespace = 'csi' //default namespace when app is started in development mode
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
    if ((namespace == 'uzgent') || (namespace == 'winfo') || (namespace == 'csi')) {  //connect to localhost for local development server
      protocol = 'http';
      port = 57772;
      domain = 'localhost';
      uri = '/csp/demo/'
    }
    ///var url = location.protocol+"//"+document.domain+":"+port+"/api/clinicom/"+namespace
    var url = protocol + '://' + domain + ":" + port + uri + "restapi/csi/"
    console.log("environment",process.env.NODE_ENV)
    this.$store.dispatch('setServer',url);
    this.$store.dispatch('setSystem',namespace);
    console.log("server is set to ",url," system is ",namespace)
  }
}
</script>
<style>
  #app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
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
</style>
