<template>
    <div v-show=showLogin> 
      <login-dialog ref="login" title="Login Server" v-on:loggedin="loggedin"></login-dialog>
    </div>
    <br>
    <div class="ps-2 pe-2">  <!-- padding start and padding end of 2 pixels -->
      <div class="container-fluid card ps-2" v-if='this.$store.getters.isLoggedIn'>  <!-- inner padding of 2 pixels -->
        <div class="card-header" v-if='this.$store.getters.isLoggedIn'>
          <div v-if="((title!='') && (title != null) && (title !== undefined))" class="">
            <b>{{title}}</b>
          </div>
          <div v-if="((error!='') && (error != null) && (error !== undefined))" class="alert alert-danger">
            <b>{{error}}</b>
          </div>
        </div>
        <div class="card-body">
          <div class="row">
            <grid-data ref="grid" titleHeading="Menu" table="Menu" v-on:gridClickRow="gridclickrow"></grid-data>
          </div>
        </div>
      </div>
    </div>  <!--card -->
</template>
  
<script>
  import LoginDialog from '@/components/LoginDialog.vue'
  import GridData from '@/components/GridData.vue'
  export default {
    components: {
      LoginDialog,
      GridData
    },
    data() {
      return {
        title : 'Menu Settings',
        error : '',
        status : '',
        filter: { 'application': '' },
        applications : []
      }
    },
    computed: {
      showLogin: function () {
        return !this.$store.getters.isLoggedIn;
      }
    },
    methods: {
      loggedin() {
        
      },
      gridclickrow(button, id) {
        if (button=='edit') {
          this.editMenu(id)
        }
      },
      editMenu(id) {
        console.log("edit", id);    
        this.$router.push('/menu/'+id);
      },
      getMenu(refresh = false) {
        this.$refs.grid.getData(JSON.stringify(this.filter),null,refresh);
      },
    },
  mounted() {
    this.getMenu();
    }
  }
  </script>