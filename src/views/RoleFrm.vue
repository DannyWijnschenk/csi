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
              <div class="col-sm-3">Name</div>
              <div class="col-sm-4"><input type="text" class="form-control" v-model="form.name"></div>
            </div>
            <div class="row mb-2">
              <div class="col-sm-3">Description</div>
              <div class="col-sm-6"><input type="text" class="form-control" v-model="form.description"/></div>
            </div>
          </div>
          <div class="row mb-1">
            <div class="col-sm-3"></div>
            <div class="col-sm-2"><div class="form-control border-0">Add</div></div>
            <div class="col-sm-2"><div class="form-control border-0">Edit</div></div>
            <div class="col-sm-2"><div class="form-control border-0">Prepare/Xecute</div></div>
          </div>

          <div class="row mb-2">
            <div class="col-sm-3 text-right">&emsp;Project</div>
            <div class="col-sm-2">
              <div class="form-check form-check-inline d-flex align-items-center">
                &emsp;
              <input class="form-check-input" type="checkbox" id="checkbox1" v-model="form.addProject">
            </div>
            </div>
            <div class="col-sm-2">
              <div class="form-check form-check-inline d-flex align-items-center">
                &emsp;
                <input class="form-check-input" type="checkbox" id="checkbox2" v-model="form.editProject">
              </div>
            </div>
          </div>

          <div class="row mb-2">
            <div class="col-sm-3 text-right">&emsp;Set</div>
            <div class="col-sm-2">
              <div class="form-check form-check-inline d-flex align-items-center">
                &emsp;
              <input class="form-check-input" type="checkbox" id="checkbox1" v-model="form.addSet">
            </div>
            </div>
            <div class="col-sm-2">
              <div class="form-check form-check-inline d-flex align-items-center">
                &emsp;
                <input class="form-check-input" type="checkbox" id="checkbox2" v-model="form.editSet">
              </div>
            </div>
            <div class="col-sm-2">
              <div class="form-check form-check-inline d-flex align-items-center">
                &emsp;
                <input class="form-check-input" type="checkbox" id="checkbox3" v-model="form.prepareSet">
              </div>
            </div>
          </div>

          <div class="row mb-2">
            <div class="col-sm-3 text-right">&emsp;Select Concepts</div>
            <div class="col-sm-2">
                &emsp;
            </div>
            <div class="col-sm-2">
              <div class="form-check form-check-inline d-flex align-items-center">
                &emsp;
                <input class="form-check-input" type="checkbox" id="checkbox2" v-model="form.selectConcepts">
              </div>
            </div>
          </div>

          <div class="row mb-2">
            <div class="col-sm-3 text-right">&emsp;Calculate Patients</div>
            <div class="col-sm-2">
                &emsp;
            </div>
            <div class="col-sm-2">
              <div class="form-check form-check-inline d-flex align-items-center">
                &emsp;
                <input class="form-check-input" type="checkbox" id="checkbox2" v-model="form.calculatePatients">
              </div>
            </div>
          </div>

          <div class="row mb-2">
            <div class="col-sm-3 text-right">&emsp;Identify Patients</div>
            <div class="col-sm-2">
                &emsp;
            </div>
            <div class="col-sm-2">
              <div class="form-check form-check-inline d-flex align-items-center">
                &emsp;
                <input class="form-check-input" type="checkbox" id="checkbox2" v-model="form.identifyPatients">
              </div>
            </div>
          </div>

          <div class="row mb-2">
            <div class="col-sm-3 text-right">&emsp;Export CSV</div>
            <div class="col-sm-2">
                &emsp;
            </div>
            <div class="col-sm-2">
                &emsp;
            </div>
            <div class="col-sm-2">
              <div class="form-check form-check-inline d-flex align-items-center">
                &emsp;
                <input class="form-check-input" type="checkbox" id="checkbox2" v-model="form.exportCSV">
              </div>
            </div>
          </div>

          <div class="row mb-2">
            <div class="col-sm-3 text-right">&emsp;Export Domain</div>
            <div class="col-sm-2">
                &emsp;
            </div>
            <div class="col-sm-2">
                &emsp;
            </div>
            <div class="col-sm-2">
              <div class="form-check form-check-inline d-flex align-items-center">
                &emsp;
                <input class="form-check-input" type="checkbox" id="checkbox2" v-model="form.exportDomain">
              </div>
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
        title : "Help role",
        question: "Do you want to delete this record from Role table ?"
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
          title : 'Change parameter',
          form : {id : '', 'name': '', 'description' : '', 'addProject': 0, 'addSet': 0, 'calculatePatients': 0, 
                  'editProject': 0, 'editSet': 0, 'exportCSV': 0, 'exportDomain': 0, 'identifyPatients': 0, 
                  'prepareSet': 0, 'selectConcepts': 0},

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
            url = this.$store.getters.serverUrl+"/csi/roleedit/";
            method = "POST";
        } else {
            url = this.$store.getters.serverUrl+"/csi/roleedit/" + this.form.id;
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
        var url = this.$store.getters.serverUrl+"/csi/roleedit/"+this.form.id;
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
          title : "Help role",
          question: "Do you want to delete this record from Role table ?"
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
        var url = this.$store.getters.serverUrl+"/csi/roleedit/"+this.form.id;
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
          this.$router.push('/role');
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