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
              <div class="col-sm-3">Volgorde</div>
              <div class="col-sm-1"><input type="text" class="form-control" v-model="form.executionOrder"/></div>
            </div>
            <div class="row mb-2">
              <div class="col-sm-3">Omschrijving</div>
              <div class="col-sm-6"><input type="text" class="form-control" v-model="form.description"/></div>
            </div>
            <div class="row mb-2">
              <div class="col-sm-3">Catalogus API</div>
               <div class="col-sm-5"><input type="text" class="form-control" v-model="form.catalogDescriptionOutput" disabled></div>
               <div class="col-sm-1"><button type="button" class="btn btn-outline-secondary" v-on:click="lookupCatalog();"><font-awesome-icon icon="fa-regular fa-pen-to-square" /></button></div>
            </div>
            <div class="row mb-2">
              <div class="col-sm-3"></div>
               <div class="col-sm-5"><input type="text" class="form-control" v-model="form.catalogUrlOutput" disabled></div>
             </div>
            <div class="row mb-2">
              <div class="col-sm-3">Verwachte Status</div>
              <div class="col-sm-2">
                <select class="form-select" v-model="form.expectedStatus">
                  <option v-for="statusObj in statuses" v-bind:key="statusObj.code" v-bind:value="statusObj.code">{{statusObj.code}} ({{statusObj.description}})</option>
                </select>
              </div>
            </div>
            <div class="row mb-2">
              <div class="col-sm-3">Request</div>
              <div class="col-sm-6"><textarea class="form-control" v-model="form.request" rows="5"></textarea></div>
            </div>
            <div class="row mb-2">
              <div class="col-sm-3">Http server call</div>
              <div class="col-sm-4"><input type="checkbox" class="form-check-input" v-model="form.httpServerCall"/></div>
            </div>
            <div class="row mb-2">
              <div class="col-sm-3">Specifieke gebruiker naam</div>
              <div class="col-sm-2"><input type="text" class="form-control" v-model="form.userName"/></div>
            </div>
            <div class="row mb-2">
              <div class="col-sm-3">Specifieke toegangscode</div>
              <div class="col-sm-2"><input type="text" class="form-control" v-model="form.userAccessCode"/></div>
            </div>
            <div class="row mb-2">
              <div class="col-sm-3">Parameters</div>
              <div class="col-sm-9">
                <div class="row">
                  <div class="col-sm-4">Veldnaam</div>
                  <div class="col-sm-1"> = </div>
                  <div class="col-sm-4">Waarde</div>
                  <div class="col-sm-1"><button type="button" class="btn btn-outline-secondary"  v-on:click="addParameter();"><font-awesome-icon icon="fa-solid fa-plus" /></button></div>
                </div>
                <div class="row" v-for="(parameter, index) in form.parameters" :key="parameter">
                  <div class="col-sm-4">    <input type="text" class="form-control" v-model="parameter.key">  </div>
                  <div class="col-sm-1"> = </div>
                  <div class="col-sm-4">   <input type="text" class="form-control" v-model="parameter.value"> </div>
                  <div class="col-sm-1"><button type="button" class="btn btn-outline-secondary"  v-on:click="deleteParameter(index);"><font-awesome-icon icon="fa-solid fa-trash-can" /></button></div>
                </div>
              </div>
            </div>
        </div>
          <div class="card-footer">
            <div class="row mb-2">
              <div class="col-sm-5">
                <button type="button" class="btn btn-outline-primary" v-on:click="saveData();">Bewaar</button>&nbsp;
                <button type="button" class="btn btn-outline-danger" v-on:click="confirmDelete();">Verwijder</button>&nbsp;
                <button type="button" class="btn btn-outline-secondary" v-on:click="back();">Terug</button>&nbsp;
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>

    <!-- modal 'popup' for search on catalog -->
    <div>
      <modal-lookup-catalog title="Zoek catalogus api" :category=defaultCategory v-if="isModalCatalogVisible" v-on:closemodalcatalog="closeModalCatalog">
      </modal-lookup-catalog>
    </div>

    <!-- put it in the template of your App.vue file to make dialogs work -->
    <!-- Don't need import the component, if you installed the plugin -->
    <DialogsWrapper />

  </template>
  
  <script>
  import LoginDialog from '@/components/LoginDialog.vue'
  import ModalLookupCatalog from '@/components/ModalLookupCatalog.vue';
  import ModalDialog from '@/components/ModalDialog.vue'
  import { createConfirmDialog } from 'vuejs-confirm-dialog'

  
  export default {
    setup() {
      const { reveal, onConfirm, onCancel } = createConfirmDialog(ModalDialog, {
        title : "Scenario Test verwijderen",
        question: "Bent u zeker om deze test te verwijderen ?"
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
      ModalLookupCatalog
    },

    data() {
      return {
          error : '',
          status : '',
          message : '',
          title : 'Opvragen scenario test',
          filter: {},
          scenarioId : '',
          form: { id: '', 'description': '', 'executionOrder': '', 'request': '', 'catalogId' : '', 'catalog': {'category' : '', 'comment' : ''}, 'httpServerCall': '', 'parameters': [ ] },
          isModalCatalogVisible: false,
          defaultCategory : '',
          statuses : [
              { 'code': 200, 'description': 'ok' },
              { 'code': 201, 'description': 'created' },
              { 'code': 204, 'description': 'no content' },
              { 'code': 400, 'description': 'bad request' },
              { 'code': 401, 'description': 'unauthorized' },
              { 'code': 403, 'description': 'forbidden' },
              { 'code': 404, 'description': 'not found' },
              { 'code': 409, 'description': 'conflict' },
              { 'code': 418, 'description': 'i\'m a teapot' },
              { 'code': 500, 'description': 'internal server error' },
          ]
          
      }
    },
    computed: {
      user : function() {
        return this.form.catalog;
      },
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
        var url, method
        if (this.form.id == '') {
          url = "/api/web/ric/unittest/scenario/" + this.scenarioId + "/part";
          method = "POST";
        } else {
          url = "/api/web/ric/unittest/scenario/" + this.scenarioId + "/part/" + this.form.id;
          method = "PUT";
        }
        fetch(url, {
          "headers" : { "Authorization": 'Bearer ' + this.$store.getters.serverAccessToken },
          "method": method,
          "body" : JSON.stringify(this.form)
        }).then(response => {
          return response.json()
        }).then(response => {
          this.message = response.message;
          this.error = response.error;
          if ((this.error == undefined) || (this.error == null)) {
            this.form.id = response.id;
            this.$toast.success('Bewaard');
          }
        });
      },
      confirmDelete() {
        const dialog = createConfirmDialog(ModalDialog,  {
          title : "Scenario Test verwijderen",
          question: "Bent u zeker om deze test te verwijderen ?"
        })
        dialog.onConfirm(() => {
          this.deleteData()
        })
        dialog.reveal();
      },
      deleteData() {
        if (this.form.id !== '') {
          this.$refs.login.refresh(this.deleteDataCB);
        }
      },
      deleteDataCB() {
        var url, method
        url = "/api/web/ric/unittest/scenario/" + this.scenarioId + "/part/" + this.form.id;
        method = "DELETE";
        fetch(url, {
            "headers": { "Authorization": 'Bearer ' + this.$store.getters.serverAccessToken },
          "method": method,
            "body": JSON.stringify(this.form)
        }).then(response => {
          return response.json()
        }).then(response => {
          this.message = response.message;
          this.error = response.error;
          if ((this.error == undefined) || (this.error == null)) {
            this.$toast.success('Verwijderd');
            this.back();
          }
        });
      },
      getData() {
        this.$refs.login.refresh(this.getDataCB);
      },
      getDataCB() {
        var url = "/api/web/ric/unittest/scenario/"+this.scenarioId + "/part/" + this.form.id;
        fetch(url, {
          "headers" : { "Authorization": 'Bearer ' + this.$store.getters.serverAccessToken },
          "method": "GET"
        }).then(response => {
          return response.json() 
        }).then(response => {
          this.message = response.message;
          this.error = response.error;
          this.form = response;
          this.form.catalogDescriptionOutput = this.form.catalog.category + ' - ' + this.form.catalog.comment;
          this.form.catalogUrlOutput = this.form.catalog.httpMethod + ' ' + this.form.catalog.url;
          this.$refs.grid.getData(JSON.stringify({ "scenarioPartId": this.form.id }));
        });
      },
      getCatalog() {
        this.$refs.login.refresh(this.getCatalogCB);
      },
      getCatalogCB() {
        fetch("/api/web/ric/unittest/catalog/" + this.form.catalogId, {
          "headers" : { "Authorization": 'Bearer ' + this.$store.getters.serverAccessToken },
          "method": "GET"
        }).then(response => {
          return response.json()
        }).then(response => {
          this.message = response.message;
          this.error = response.error;
          this.form.catalog = response;
          this.form.catalogDescriptionOutput = this.form.catalog.category + ' - ' + this.form.catalog.comment;
          this.form.catalogUrlOutput = this.form.catalog.httpMethod + ' ' + this.form.catalog.url;
          this.form.request = this.form.catalog.requestDefault
          this.form.parameters = []
          for (var iParam=0; iParam < this.form.catalog.parameters.length; iParam++) {
            this.form.parameters.push({ key: this.form.catalog.parameters[iParam].name, value: '' })
          }
        });
      }, 
      getScenarioDefaultCategory() {
        this.$refs.login.refresh(this.getScenarioDefaultCategoryCB);
      },
      getScenarioDefaultCategoryCB() {
        fetch("/api/web/ric/unittest/scenario/" + this.scenarioId, {
          "headers" : { "Authorization": 'Bearer ' + this.$store.getters.serverAccessToken },
          "method": "GET"
        }).then(response => {
          return response.json()
        }).then(response => {
          this.message = response.message;
          this.error = response.error;
          this.defaultCategory = response.defaultCategory;
        });
      },
      getHttpStatus() {
        fetch("/api/web/ric/unittest/httpstatus", {
          "headers" : { "Authorization": 'Bearer ' + this.$store.getters.serverAccessToken },
          "method": "GET"
        }).then(response => {
          return response.json()
        }).then(response => {
          this.message = response.message;
          this.error = response.error;
          console.log(this.statuses, response);
          if (response != '') {
            this.statuses = response;
          }
        });
      },
      lookupCatalog() {
        this.isModalCatalogVisible = true;
      },
      closeModalCatalog(buttonName, buttonId) {
        this.isModalCatalogVisible = false;
        if (buttonId !=='') {
          this.form.catalogId = buttonId;
          this.getCatalog();
          console.log('form after lookup catalog', this.form)
        }
      },
      addParameter() {
        this.form.parameters.push({'name' : '', 'value':''})
      },
      deleteParameter(index) {
        this.form.parameters.splice(index,1)
      },
      back() {
          this.$router.push('/scenarios/'+this.scenarioId+'/parts');
      },
    },
    mounted() {
      this.scenarioId = this.$route.params.scenarioId
      this.getScenarioDefaultCategory()
      if (this.$route.params.partId == 'new') {
        this.form.id = ''
        this.form.scenarioId = this.scenarioId
      } else {
        this.form.id = this.$route.params.partId
        this.getData()
      }
    }
  }
  </script>