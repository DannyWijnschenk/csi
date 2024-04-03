<template>
  <div>
    <div v-show="showLogin">
      <login-dialog ref="login" title="Login Server" @loggedin="loggedin"></login-dialog>
    </div>
    <br>
    <div class="px-2">
      <form v-if="this.$store.getters.isLoggedIn">
        <div class="container-fluid card">
          <div class="card-header">
            <div>
              <b>{{ title }}</b>
            </div>
            <div v-if="message" class="alert">
              <b>{{ message }}</b>
            </div>
            <div v-if="error" class="alert alert-danger">
              <b>{{ error }}</b>
            </div>
          </div>
          <div class="card-body">
            <div class="row mb-1">
              <label for="id" class="col-sm-3 col-form-label">Id</label>
              <div class="col-sm-4">{{ form.id }}</div>
            </div>
            <div class="row mb-2">
              <div class="col-sm-3">CalculationCode</div>
              <div class="col-sm-4"><input type="text" class="form-control" v-model="form.calculationCode"></div>
            </div>
            <div class="row mb-2">
              <div class="col-sm-3">CalculationType</div>
              <div class="col-sm-6"><input type="text" class="form-control" v-model="form.calculationType"/></div>
            </div>
            <div class="row mb-2">
                <div class="col-sm-3">Datatype</div>
                <div class="col-sm-6">
                    <select class="form-select" v-model="form.datatype">
                        <option value="String">String</option>
                        <option value="Numeric">Numeric</option>
                        <option value="Date">Date</option>
                    </select>
                </div>
            </div>
            <div class="row mb-2">
              <div class="col-sm-3">Description</div>
              <div class="col-sm-6"><input type="text" class="form-control" v-model="form.description"/></div>
            </div>
            <div class="row mb-2">
              <div class="col-sm-3">Name</div>
              <div class="col-sm-6"><input type="text" class="form-control" v-model="form.name"/></div>
            </div>
            <div class="row mb-2">
              <div class="col-sm-3">Namespace</div>
              <div class="col-sm-6"><input type="text" class="form-control" v-model="form.namespace"/></div>
            </div>

            <div class="row mb-2" v-for="(value, index) in form.operators" :key="index">
              <div class="col-sm-3" v-if="index === 0">Operators</div>
              <div class="col-sm-3" v-else></div>
              <div class="col-sm-6">
                <select class="form-select" v-model="form.operators[index]">
                  <option v-for="(option, index) in operatorOptions" :value="option" :key="index">
                    {{ option }}
                  </option>
                </select>
              </div>

              <div class="col-sm-3">
                <button
                        type="button" 
                        class="btn btn-outline-primary"
                        v-if="index === 0"
                        @click.prevent="addNewInputOperators"
                      >
                      <i class="fa fa-plus" aria-hidden="true"></i>

                </button>
                <button
                        type="button" 
                        class="btn btn-outline-primary"
                        v-if="index !== 0"
                        @click.prevent=""
                        style="opacity: 0;"
                      >
                      <i class="fa fa-plus" aria-hidden="true"></i>

                </button>
                <button
                        type="button" 
                        class="btn btn-outline-secondary"
                        v-if="form.operators.length > 1" 
                        @click.prevent="removeOperator(index)"
                      >
                      <i class="fa fa-trash" aria-hidden="true"></i>
                </button>
              </div>
            </div>



            <div class="row mb-2" v-for="(value, index) in form.parameters" :key="index">
              <div class="col-sm-3" v-if="index === 0">Parameters</div>
              <div class="col-sm-3" v-else></div>
              <div class="col-sm-6">
                <div class="input-group mb-2">
                  <input type="text" class="form-control" v-model="form.parameters[index]" />
                </div>
                <input v-if="!form.parameters.length" type="text" class="form-control" />
              </div>

              <div class="col-sm-3">
                <button
                        type="button" 
                        class="btn btn-outline-primary"
                        v-if="index === 0"
                        @click.prevent="addNewInputParam"
                      >
                      <i class="fa fa-plus" aria-hidden="true"></i>
                </button>
                <button
                        type="button" 
                        class="btn btn-outline-primary"
                        v-if="index !== 0"
                        @click.prevent=""
                        style="opacity: 0;"
                    >
                    <i class="fa fa-plus" aria-hidden="true"></i>
                </button>
                <button
                        type="button" 
                        class="btn btn-outline-secondary"
                        v-if="form.parameters.length > 1" 
                        @click.prevent="removeParam(index)"
                      >
                      <i class="fa fa-trash" aria-hidden="true"></i>
                </button>
              </div>
            </div>




            <div class="row mb-2">
              <div class="col-sm-3">ValueDelimiter</div>
              <div class="col-sm-6"><input type="text" class="form-control" v-model="form.valueDelimiter"/></div>
            </div>



            <div class="row mb-2" v-for="(value, index) in form.values" :key="index">
              <div class="col-sm-3" v-if="index === 0">Values</div>
              <div class="col-sm-3" v-else></div>
              <div class="col-sm-6">
                <div class="input-group mb-2">
                  <input type="text" class="form-control" v-model="form.values[index]" />
                </div>
                <input v-if="!form.values.length" type="text" class="form-control" />
              </div>

              <div class="col-sm-3">
                <button
                        type="button" 
                        class="btn btn-outline-primary"
                        v-if="index === 0"
                        @click.prevent="addNewInputValues"
                      >
                      <i class="fa fa-plus" aria-hidden="true"></i>
                </button>
                <button
                        type="button" 
                        class="btn btn-outline-primary"
                        v-if="index !== 0"
                        @click.prevent=""
                        style="opacity: 0;"
                    >
                    <i class="fa fa-plus" aria-hidden="true"></i>
                </button>
                <button
                        type="button" 
                        class="btn btn-outline-secondary" v-if="form.values.length > 1" 
                        @click.prevent="removeValues(index)"
                      >
                      <i class="fa fa-trash" aria-hidden="true"></i>
                </button>
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
  </div>

  <DialogsWrapper />

</template>
  
  <script>
  import LoginDialog from '@/components/LoginDialog.vue'
  import '@fortawesome/fontawesome-free/css/all.css';
  import ModalDialog from '@/components/ModalDialog.vue'
  import { createConfirmDialog } from 'vuejs-confirm-dialog'



  
  export default {
    setup() {
      const { reveal, onConfirm, onCancel } = createConfirmDialog(ModalDialog, {
        title : "DataField delete",
        question: "Do you want to delete this record from DataField table ?"
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
          operatorOptions: [],
          error : '',
          status : '',
          message: '',
          title : 'Change DataField',
          form : {id : '', 'calculationCode': '', 'calculationType': '', 'datatype': '', 'description': '', 'name': '', 'namespace': '', 'operators': [''], 'parameters': [''], 'valueDelimiter': '', 'values': ['']},
      }
    },
    computed: {
      showLogin: function ()
      {
        return !this.$store.getters.isLoggedIn;
      }
    },
    methods: {
      addNewInputParam() {
        if (!Array.isArray(this.form.parameters)) {
          this.$set(this.form, 'parameters', []);
        }
        this.form.parameters.push('');
      },
      addNewInputValues() {
        if (!Array.isArray(this.form.values)) {
          this.$set(this.form, 'values', []);
        }

        this.form.values.push('');
      },
      addNewInputOperators() {
        if (!Array.isArray(this.form.operators)) {
          this.$set(this.form, 'operators', []);
        }

        this.form.operators.push('');
      },
      removeOperator(index) {
        this.form.operators.splice(index, 1);
      },
      removeValues(index) {
        this.form.values.splice(index, 1);
      },
      removeParam(index) {
        this.form.parameters.splice(index, 1);
      },
      loggedin() {
      },
      saveData() {
        this.$refs.login.refresh(this.saveDataCB);
      },
      saveDataCB() {
        var url = ""
        var method = ""  
        if (this.form.id == '') {
            url = this.$store.getters.serverUrl + "/datafieldedit/";
            method = "POST";
        } else {
            url = this.$store.getters.serverUrl + "/datafieldedit/" + this.form.id;
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
      fetchOperatorOptions() {
        const url = this.$store.getters.serverUrl + "/fieldoperator";

        fetch(url, {
          "headers" : { "Authorization": 'Bearer ' + this.$store.getters.serverAccessToken },
          "method": "GET"
        }).then(response => {
          return response.json()
        }).then(response => {
          this.operatorOptions = response.result;
          console.log("list", this.operatorOptions);
        })
      }, 
      getData() {
        this.$refs.login.refresh(this.getDataCB);
      },
      getDataCB() {
        var url = this.$store.getters.serverUrl + "/datafieldedit/"+this.form.id;
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
          title : "DataField delete",
          question: "Do you want to delete this record from DataField table ?"
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
        var url = this.$store.getters.serverUrl + "/datafieldedit/"+this.form.id;
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
          this.$router.push('/datafield');
      },
    },
    created() {
    },
    mounted() {
      this.fetchOperatorOptions();
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