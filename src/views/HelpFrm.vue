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
              <div class="col-sm-3">DisplayOrder</div>
              <div class="col-sm-4"><input type="text" class="form-control" v-model="form.displayOrder"></div>
            </div>
            <div class="row mb-2">
              <div class="col-sm-3">Form</div>
              <div class="col-sm-6"><input type="text" class="form-control" v-model="form.form"/></div>
            </div>
            <div class="row mb-2">
              <div class="col-sm-3">Field</div>
              <div class="col-sm-6"><input type="text" class="form-control" v-model="form.field"/></div>
            </div>
            <div class="row mb-2">
                <div class="col-sm-3">Language</div>
                <div class="col-sm-6">
                    <select class="form-select" v-model="form.language">
                        <option value="NL">NL</option>
                        <option value="EN">EN</option>
                        <option value="FR">FR</option>
                    </select>
                </div>
            </div>
            <div class="row mb-2">
              <div class="col-sm-3">Title</div>
              <div class="col-sm-6"><input type="text" class="form-control" v-model="form.title"/></div>
            </div>
            <div class="row mb-2">
              <div class="col-sm-3">Content</div>
              <div class="col-sm-6"><input type="text" class="form-control" v-model="form.content"/></div>
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

  <DialogsWrapper />

  <script>
  import LoginDialog from '@/components/LoginDialog.vue'
  import ModalDialog from '@/components/ModalDialog.vue'
  import { createConfirmDialog } from 'vuejs-confirm-dialog'
  
  export default {
    setup() {
      const { reveal, onConfirm, onCancel } = createConfirmDialog(ModalDialog, {
        title : "Help delete",
        question: "Do you want to delete this record from Help table ?"
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
          title : 'Change help',
          form : {id : '', 'displayOrder': '', 'form' : '', 'field': '', 'language': '', 'title': '', 'content': ''},
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
            url = this.$store.getters.serverUrl+"/csi/helpedit/";
            method = "POST";
        } else {
            url = this.$store.getters.serverUrl+"/csi/helpedit/" + this.form.id;
            method = "POST";
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
        var url = this.$store.getters.serverUrl+"/csi/helpedit/"+this.form.id;
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
          title : "Help delete",
          question: "Do you want to delete this record from Help table ?"
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
        var url = this.$store.getters.serverUrl+"/csi/helpedit/"+this.form.id;
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
          this.$router.push('/help');
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