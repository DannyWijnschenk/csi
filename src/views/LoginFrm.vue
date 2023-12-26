<template>
    <div v-show=showLogin> 
      <login-dialog ref="login" title="Login Server" :ott="getOtt()" v-on:loggedin="loggedin"></login-dialog>
    </div>
    <div class="home" v-if='this.$store.getters.isLoggedIn'>
      <!-- Welkom, {{getUser()}} -->
    </div>
  </template>
  
  <script>
  import LoginDialog from '@/components/LoginDialog.vue'
  export default {
    components: {
      LoginDialog,
    },
    computed: {
      showLogin: function () {
        return !this.$store.getters.isLoggedIn;
      }
    },
    data() {
      return {
      }
    },
    methods: {
      loggedin() {
        //todo : get additional rights for this application
        console.log('logged in');
      },
      getUser() {
        return this.$store.getters.user
      },
      getOtt() {  //this code will get the ott parameter faster than the code which is in mounted() !!!
        return this.$route.query.ott;
      }
    },
    mounted() {
      console.log('login mounted');
      this.$store.dispatch('logOut');
    },
    activated() {
      this.$store.dispatch('logOut');
    }
  }
  </script>