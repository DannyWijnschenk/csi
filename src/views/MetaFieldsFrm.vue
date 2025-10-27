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
              <div class="col-sm-3">MetaField Name</div>
              <div class="col-sm-6"><input type="text" class="form-control" v-model="form.MetaFieldName"/></div>
            </div>
            <div class="row mb-2">
              <div class="col-sm-3">Display Name</div>
              <div class="col-sm-4"><input type="text" class="form-control" v-model="form.DisplayName"></div>
            </div>
            <div class="row mb-2">
              <div class="col-sm-3">Domain Name</div>
              <div class="col-sm-6"><input type="text" class="form-control" v-model="form.DomainName"/></div>
            </div>
            <div class="row mb-2">
              <div class="col-sm-3">In Members</div>
              <div class="col-sm-6"><input type="checkbox" class="form-check-input" v-model="form.inMembers"/></div>
            </div>
            <div class="row mb-2">
              <div class="col-sm-3">In Sentences</div>
              <div class="col-sm-6"><input type="checkbox" class="form-check-input" v-model="form.inSentences"/></div>
            </div>
            <div class="row mb-2">
              <div class="col-sm-3">In Timeline</div>
              <div class="col-sm-6"><input type="checkbox" class="form-check-input" v-model="form.InTimeline"/></div>
            </div>
            <div class="row mb-2">
              <div class="col-sm-3">In Export</div>
              <div class="col-sm-6"><input type="checkbox" class="form-check-input" v-model="form.InExport"/></div>
            </div>
            <div class="row mb-2">
              <div class="col-sm-3">Source Order</div>
              <div class="col-sm-6"><input type="text" class="form-control" v-model="form.SourceOrder"/></div>
            </div>
            <div class="row mb-2">
              <div class="col-sm-3">Sentence Order</div>
              <div class="col-sm-6"><input type="text" class="form-control" v-model="form.SentenceOrder"/></div>
            </div>
            <div class="row mb-2">
              <div class="col-sm-3">Timeline Order</div>
              <div class="col-sm-6"><input type="text" class="form-control" v-model="form.TimelineOrder"/></div>
            </div>
            <div class="row mb-2">
              <div class="col-sm-3">Need Anonymization</div>
              <div class="col-sm-6"><input type="checkbox" class="form-check-input" v-model="form.NeedAnonymization"/></div>
            </div>
            <div class="row mb-2">
              <div class="col-sm-3">Markup</div>
              <div class="col-sm-6"><input type="text" class="form-control" v-model="form.Markup"/></div>
            </div>
            <div class="row mb-2">
              <div class="col-sm-3">Markup Value</div>
              <div class="col-sm-6"><input type="text" class="form-control" v-model="form.MarkupValue"/></div>
            </div>
            <div class="row mb-2">
              <div class="col-sm-3">Is Url</div>
              <div class="col-sm-6"><input type="checkbox" class="form-check-input" v-model="formIsUrl"/></div>
            </div>
          </div>
          <div class="card-footer">
            <div class="row mb-2">
              <div class="col-sm-5">
                <button type="button" class="btn btn-outline-primary" v-on:click="saveData();">Save</button>&nbsp;
                <button v-if="(form.id!=='')&&(form.id!==undefined)" type="button" class="btn btn-outline-danger" v-on:click="removeData();">Delete</button>&nbsp;
                <button type="button" class="btn btn-outline-secondary" v-on:click="back();">Back</button>&nbsp;
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  </template>
  
  <script>
  import LoginDialog from '@/components/LoginDialog.vue'
  
  export default {
    setup() {
    },
    components: {
      LoginDialog
    },
    data() {
      return {
          error : '',
          status : '',
          message: '',
          title : 'Change Metafields',
          form : {id : '', 'DisplayName': '', 'DomainName' : '', 'InExport': 0, 'InTimeline': 0, 'IsUrl': 0, 'Markup': '',
                  'MarkupValue': '', 'MetaFieldName': '', 'NeedAnonymization': 0, 'SentenceOrder': '', 'SourceOrder': '',
                   'TimelineOrder': '', 'inMembers': 0, 'inSentences': 0},
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
            url = "/api/web/metafield";
            method = "POST";
        } else {
            url = "/api/web/metafield/" + this.form.id;
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
        var url = "/api/web/metafield/"+this.form.id;
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
      removeDataCB() {
        var url = "/api/web/metafield/"+this.form.id;
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
          this.$router.push('/metafield');
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