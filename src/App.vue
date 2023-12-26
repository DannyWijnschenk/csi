<template>
<!--<sidebar-menu v-if='this.$store.getters.isLoggedIn' :menu="menu" v-model:collapsed="collapsed" :theme="selectedTheme" @item-click="onSidebarClick"/>-->
<sidebar-menu :menu="menu" v-model:collapsed="collapsed" :theme="selectedTheme" @item-click="onSidebarClick"/>
  <nav>
    <router-link to="/">Home</router-link> |
    <router-link to="/about">About</router-link>
  </nav>
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
