<template>
    <div v-show=showLogin> 
      <login-dialog ref="login" title="Login Server" v-on:loggedin="loggedin"></login-dialog>
    </div>
    <br>
    <div class="px-2">  <!-- padding start and padding end of 2 pixels -->
      <form v-if='this.$store.getters.isLoggedIn'>
        <div class="container-fluid card">
          <div class="card-header">
            <div>
              <b>{{title}}</b>
            </div>
            <div v-if="((message!='') && (message != null) && (message !== undefined))" class="alert">
              <b>{{message}}</b>
            </div>
            <div v-if="((error!='') && (error != null) && (error !== undefined))" class="alert alert-danger">
              <b>{{error}}</b>
            </div>
          </div>
          <div class="card-body">
            <div class="row mb-1">
              <label for="id" class="col-sm-3 col-form-label">Id</label>
              <div class="col-sm-4">{{form.id}}</div>
            </div>
            <div class="row mb-2">
              <div class="col-sm-3">WordFieldName</div>
              <div class="col-sm-4"><input type="text" class="form-control" v-model="form.wordFieldName"></div>
            </div>
            <div class="row mb-2">
              <div class="col-sm-3">DatabaseFieldName</div>
              <div class="col-sm-6"><input type="text" class="form-control" v-model="form.databaseFieldName"/></div>
            </div>
            <div class="row mb-2">
              <div class="col-sm-3">ExampleValue</div>
              <div class="col-sm-6"><input type="text" class="form-control" v-model="form.exampleValue"></div>
            </div>
            <div class="row mb-2">
              <div class="col-sm-3">Category</div>
              <div class="col-sm-6"><input type="text" class="form-control" v-model="form.category"></div>
            </div>
            <div class="row mb-2">
              <div class="col-sm-3">CalculateClass</div>
              <div class="col-sm-6"><input type="text" class="form-controlt" v-model="form.calculateClass"></div>
            </div>
            <div class="row mb-2">
              <div class="col-sm-3">CalculateMethod</div>
              <div class="col-sm-6"><input type="text" class="form-controlt" v-model="form.calculateMethod"></div>
            </div>
            <div class="row mb-2">
              <div class="col-sm-3">CalculateParameters</div>
              <div class="col-sm-6"><input type="text" class="form-controlt" v-model="form.calculateParameters"></div>
            </div>
            <div class="row mb-2">
              <div class="col-sm-3">ActiveFlag</div>
              <div class="col-sm-6"><input type="checkbox" class="form-check-input" v-model="form.activeFlag"></div>
            </div>
          </div>
          

          <div class="card-footer">
            <div class="row mb-2">
              <div class="col-sm-5">
                <button type="button" class="btn btn-outline-primary" @click="saveData">Save</button>&nbsp;
                <button type="button" class="btn btn-outline-danger" @click="confirmDelete">Delete</button>&nbsp;
                <button type="button" class="btn btn-outline-secondary" @click="back">Back</button>&nbsp;
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  </template>
  
  <script>
  import LoginDialog from '@/components/LoginDialog.vue'
  import ModalDialog from '@/components/ModalDialog.vue'
  import { createConfirmDialog } from 'vuejs-confirm-dialog'
  
  export default {
    setup() {
      const { reveal, onConfirm, onCancel } = createConfirmDialog(ModalDialog, {
        title : "Delete MergeField",
        question: "Do you want to delete this record from MergeField table ?"
      })

      onConfirm(() => {
        console.log('Confirmed!');
        this.deleteData();
      })

      onCancel(() => {
        console.log('Cancelled');
      })

      return {
        reveal
      }
    },
    components: {
      LoginDialog
    },
    data() {
      return {
          error : '',
          status : '',
          message: '',
          title : 'Change domain',
          form : {id : '', 'wordFieldName': '', 'databaseFieldName' : '', 'exampleValue': '', 'category': '', 'calculateClass': '', 'calculateMethod': '',
                  'calculateParameters': '', 'activeFlag': 0},

      }
    },
    computed: {
      showLogin: function ()
      {
        return !this.$store.getters.isLoggedIn;
      }
    },
    methods: {
      loggedin() {
      },
      saveData() {
        this.$refs.login.refresh(this.saveDataCB);
      },
      saveDataCB() {
        var url = ""
        var method = ""  
        if (this.form.id == '') {
            url = this.$store.getters.serverUrl + "/mergefield";
            method = "POST";
        } else {
            url = this.$store.getters.serverUrl + "/mergefield/" + this.form.id;
            method = "PUT";
        }
        var body = this.form
        fetch(url, {
          "headers" : { "Authorization": 'Bearer ' + this.$store.getters.serverAccessToken },
          "method": method,
          "body" : JSON.stringify(body)
        }).then(response => {
          this.httpStatus = response.status;
          return response.json()
        }).then(response => {
          this.message = response.message;
          this.error = response.error;
          if (((this.httpStatus != 200) && (this.httpStatus != 201)) || (response.status=='error')) {
            this.$toast.error('Not Saved : '+response.data)
          } else if ((this.error == undefined) || (this.error == null)) {
            this.$toast.success('Saved');
            this.form.id = response.id
          }
        });
      },    
      getData() {
        this.$refs.login.refresh(this.getDataCB);
      },
      getDataCB() {
        var url = this.$store.getters.serverUrl + "/mergefield/"+this.form.id;
        fetch(url, {
          "headers" : { "Authorization": 'Bearer ' + this.$store.getters.serverAccessToken },
          "method": "GET"
        }).then(response => {
          return response.json() 
        }).then(response => {
          this.message = response.message;
          this.error = response.error;
          this.form = response;
        });
      },
      removeData() {
        this.$refs.login.refresh(this.removeDataCB);
      },
      confirmDelete() {
        const dialog = createConfirmDialog(ModalDialog,  {
            title : "Delete MergeField",
            question: "Do you want to delete this record from MergeField table ?"
        })
        dialog.onConfirm(() => {
          this.deleteData()
        })
        dialog.reveal();
      },
      deleteData() {
        if (this.form.id !== '') {
          this.$refs.login.refresh(this.removeDataCB);
        }
      },
      removeDataCB() {
        var url = this.$store.getters.serverUrl + "/mergefield/"+this.form.id;
        fetch(url, {
          "headers" : { "Authorization": 'Bearer ' + this.$store.getters.serverAccessToken },
          "method": "DELETE"
        }).then(response => { 
          this.httpStatus = response.status;
          return response.json()
        }).then(response => {
          this.message = response.message;
          this.error = response.error;
          if (response.status=='ok') {
            this.form = {};
            this.$toast.show('Deleted', {type : 'error'});
          }
          this.back();
        });
      },
      back() {
          this.$router.push('/mergefield');
      },
    },
    created() {
    },
    mounted() {
      if (this.$route.params.id == 'new') {
        this.form.id = '';
      } else {
        this.form.id = this.$route.params.id
      }
      if ((this.form.id !== undefined) && (this.form.id != '')) {
          this.getData()
        }
    }
  }
  </script>