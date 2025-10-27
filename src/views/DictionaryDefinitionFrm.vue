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
            <div class="row mb-2">
              <div class="col-sm-3">Owner</div>
              <div class="col-sm-6"><input type="text" class="form-control" v-model="form.owner"></div>
            </div>
            <div class="row mb-2">
              <div class="col-sm-3">Department</div>
              <div class="col-sm-6"><input type="text" class="form-control" v-model="form.department"></div>
            </div>
            <div class="row mb-2">
                <div class="col-sm-3">ColorBack</div>
                <div class="col-sm-6">
                    <div class="custom-color-input" @click="openColorPicker('colorBack')">
                    <div class="selected-color" :style="{ backgroundColor: form.colorBack }"></div>
                    <input type="text" class="form-control" v-model="form.colorBack" readonly>
                    </div>
                    <input ref="colorPickerBack" type="color" class="form-control" v-model="form.colorBack" style="display: none;">
                </div>
            </div>

            <div class="row mb-2">
                <div class="col-sm-3">ColorText</div>
                <div class="col-sm-6">
                    <div class="custom-color-input" @click="openColorPicker('colorText')">
                    <div class="selected-color" :style="{ backgroundColor: form.colorText }"></div>
                    <input type="text" class="form-control" v-model="form.colorText" readonly>
                    </div>
                    <input ref="colorPickerText" type="color" class="form-control" v-model="form.colorText" style="display: none;">
                </div>
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
              <div class="col-sm-3">Enabled</div>
              <div class="col-sm-6"><input type="checkbox" class="form-check-input" v-model="form.enabled"></div>
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
        title : "Delete dictionary definition",
        question: "Do you want to delete this record from DictionaryDefinition table ?"
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
      LoginDialog,
    },
    data() {
      return {
          error : '',
          status : '',
          message: '',
          title : 'Change dictionary definition',
          form : {id : '', 'name': '', 'description' : '', 'owner': '', 'department': '', 'colorText': '#ffffff', 'colorBack': '#ffffff', 'language': '', 'enabled': 0},
          hexColor: '#ffffff'

      }
    },
    computed: {
      showLogin: function ()
      {
        return !this.$store.getters.isLoggedIn;
      }
    },
    methods: {
        openColorPicker(field) {
      const colorPicker = field === 'colorBack' ? this.$refs.colorPickerBack : this.$refs.colorPickerText;
      colorPicker.click();
    },
      updateHexColor(event) {
        const selectedColor = event.target.value;
        
        const hexColor = this.rgbToHex(selectedColor);
        
        this.hexColor = hexColor;
     },
     rgbToHex(rgb) {
      const [r, g, b] = rgb.slice(1).match(/.{1,2}/g);

      return `#${(+r).toString(16)}${(+g).toString(16)}${(+b).toString(16)}`;
    },
      loggedin() {
      },
      saveData() {
        this.$refs.login.refresh(this.saveDataCB);
      },
      saveDataCB() {
        var url = "/api/web/dictionaryedit/";
        var method = ""  
        if (this.form.id == '') {
            method = "POST";
        } else {
            url += this.form.id;
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
        var url = "/api/web/dictionaryedit/"+this.form.id;
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
            title : "Delete dictionary definition",
            question: "Do you want to delete this record from DictionaryDefinition table ?"
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
        var url = "/api/web/dictionaryedit/"+this.form.id;
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
          this.$router.push('/dictionary');
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
