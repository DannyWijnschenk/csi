<template>
     home
    <div v-show=showLogin> 
      <login-dialog ref="login" title="Login Server" :ott="getOtt()" v-on:loggedin="loggedin"></login-dialog>
    </div>
    <div class="home" v-if='this.$store.getters.isLoggedIn'>
    </div>
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
    },
    mounted() {
      console.log('home view');
    }
  }
  </script>
  