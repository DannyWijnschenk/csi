<template>
    <div v-show=showLogin> 
      <login-dialog ref="login" title="Login Server" :ott="getOtt()" v-on:loggedin="loggedin"></login-dialog>
    </div>
    <div class="home" v-if='this.$store.getters.isLoggedIn'>
     <!-- <img alt="Vue logo" src="../assets/logo.png">
      Welkom, {{getUser()}}
      -->
  
    </div>
  <!--
    <button type="button" class="btn" @click="showModal"> Open Modal! </button>
    <modal-lookup title="TheTitle" v-if="isModalVisible" v-on:closemodallookup="closemodal">
  
    </modal-lookup>
  -->
  </template>
  
  <script>
  // @ is an alias to /src
  import LoginDialog from '@/components/LoginDialog.vue'
  //import ModalLookup from '@/components/ModalLookup.vue';
  export default {
    name: 'HomeView',
    components: {
      LoginDialog,
     // ModalLookup
    },
    data() {
      return {
        isModalVisible: false
      }
    },
    computed: {
      showLogin: function ()
      {
        return !this.$store.getters.isLoggedIn;
      }
    },
    methods: {
      getOtt() {  //this code will get the ott parameter faster than the code which is in mounted() !!!
        return this.$route.query.ott;
      },
      loggedin() {
        console.log('logged in');
     },
      getUser() {
        //this.$toast.show(`Hey! I'm here`);
        return this.$store.getters.user
      },
      showModal() {
        this.isModalVisible = true;
       },
      closemodal() {
        this.isModalVisible = false;
      }
    }
  }
  </script>
  