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
              <label for="id" class="col-sm-3 col-form-label">ID</label>
              <div class="col-sm-4">{{form.id}}</div>
            </div>
            <div class="row mb-2">
              <div class="col-sm-3">Initials</div>
              <div class="col-sm-4"><input type="text" class="form-control" v-model="form.initials"></div>
            </div>
            <div class="row mb-2">
              <div class="col-sm-3">FirstName</div>
              <div class="col-sm-4"><input type="text" class="form-control" v-model="form.firstName"></div>
            </div>
            <div class="row mb-2">
              <div class="col-sm-3">LastName</div>
              <div class="col-sm-6"><input type="text" class="form-control" v-model="form.lastName"/></div>
            </div>
            <div class="row mb-2">
              <div class="col-sm-3">FullName</div>
              <div class="col-sm-6"><input type="text" class="form-control" v-model="form.fullName"/></div>
            </div>
            <div class="row mb-2">
              <div class="col-sm-3">Default Domain</div>
              <div class="col-sm-6">
                <select class="form-select" v-model="form.defaultDomain">
                  <option v-for="(option, index) in domainList" :value="option.name" :key="index">
                    {{ option.name }}
                  </option>
                </select>
              </div>
            </div>
            <div class="row mb-2">
              <div class="col-sm-3">Default Set Member</div>
              <div class="col-sm-6">
                <select class="form-select" v-model="form.defaultSetMember">
                  <option v-for="(option, index) in getFieldOptions()" :value="option.name" :key="index">
                    {{ option.name }}
                  </option>
                </select>
              </div>
            </div>
            <div class="row mb-2">
              <div class="col-sm-3">Default Show Dashboard</div>
              <div class="col-sm-6">
                <select class="form-select" v-model="form.defaultShowDashboard">
                    <option value="All">All</option>
                    <option value="Favorites">Favorites</option>
                    <option value="Waiting for Input">Waiting for Input</option>
                </select>
            </div>
            </div>
            <div class="row mb-2">
              <div class="col-sm-3">Page Elements</div>
              <div class="col-sm-6"><input type="text" class="form-control" v-model="form.pageElements"/></div>
            </div>
            <div class="row mb-2">
              <div class="col-sm-3">Page Members</div>
              <div class="col-sm-6"><input type="text" class="form-control" v-model="form.pageMembers"/></div>
            </div>
            <div class="row mb-2">
              <div class="col-sm-3">Show Help</div>
              <div class="col-sm-6"><input type="checkbox" class="form-check-input" v-model="form.showHelp"/></div>
            </div>
            <div class="row mb-2">
              <div class="col-sm-3">Email</div>
              <div class="col-sm-6"><input type="text" class="form-control" v-model="form.email"/></div>
            </div>
            <div class="row mb-2">
              <div class="col-sm-3">Group</div>
              <div class="col-sm-6"><input type="text" class="form-control" v-model="form.group"/></div>
            </div>
            <div class="row mb-2">
              <div class="col-sm-3">Role</div>
              <div class="col-sm-6">
                <select class="form-select" v-model="form.role">
                  <option v-for="(option, index) in roleList" :value="option.name" :key="index">
                    {{ option.name }}
                  </option>
                </select>
              </div>
            </div>
            <div class="row mb-2">
              <div class="col-sm-3">Enabled From</div>
              <div class="col-sm-6"><vue-Datepicker v-model="form.enabledFrom" locale="nld" cancelText="back" selectText="select" format="dd/MM/yyyy HH:mm" :min-date="minDate" :disabled="form.id !== ''" autoApply></vue-Datepicker></div>
            </div>
            <div class="row mb-2">
              <div class="col-sm-3">Enabled To</div>
              <div class="col-sm-6"><vue-Datepicker v-model="form.enabledTo" locale="nld" cancelText="back" selectText="select" format="dd/MM/yyyy HH:mm" :min-date="minDate" :disabled="form.id !== ''" autoApply></vue-Datepicker></div>
            </div>
            <div class="row mb-2">
              <div class="col-sm-3">System Manager</div>
              <div class="col-sm-6"><input type="checkbox" class="form-check-input" v-model="form.systemManager"/></div>
            </div>
            <div class="row mb-2">
              <div class="col-sm-3">Patient Explorer</div>
              <div class="col-sm-6"><input type="checkbox" class="form-check-input" v-model="form.patientExplorer"/></div>
            </div>
            <div class="row mb-2">
              <div class="col-sm-3">Anonymized Data</div>
              <div class="col-sm-6"><input type="checkbox" class="form-check-input" v-model="form.anonymizedData"/></div>
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
          domainList: [],
          domainFieldList: [],
          roleList: [],
          error : '',
          status : '',
          message: '',
          title : 'Change UserSettings',
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
      getFieldOptions() {
            try {
            const selectedDomain = this.selectDomainByDefault();
            return selectedDomain ? selectedDomain.fields : [];
            } catch (error) {
            console.error("Error while getting field options:", error);
            return [];
            }
        },
      selectDomainByDefault() {
        if (this.form && this.form.defaultDomain && typeof this.form.defaultDomain === 'string') {
            return this.domainList.find(domain => domain.name === this.form.defaultDomain.trim());
        } else {
            return {"fields": []};
        }
        },
      saveData() {
        this.$refs.login.refresh(this.saveDataCB);
      },
      saveDataCB() {
        var url = ""
        var method = ""  
        if (this.form.id == '') {
            url = this.$store.getters.serverUrl + "/useredit/" + this.form.initials;
            method = "POST";
        } else {
            url = this.$store.getters.serverUrl + "/useredit/" + this.form.initials;
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
        var url = this.$store.getters.serverUrl + "/useredit/"+this.form.id;
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
      fetchDomains() {
        const url = this.$store.getters.serverUrl + "/domain";

        fetch(url, {
            headers: { "Authorization": 'Bearer ' + this.$store.getters.serverAccessToken },
            method: "GET"
        })
        .then(response => response.json())
        .then(response => {
            this.domainList = response.result.map(domain => ({
            ...domain,
            fields: []
            }));
            console.log("Domain list:", this.domainList);

            this.fetchDomainFields();
        })
        .catch(error => {
            console.error("Error fetching domains:", error);
        });
    },

    fetchDomainFields() {
        const fieldRequests = this.domainList.map(domain => {
            const fieldUrl = this.$store.getters.serverUrl + "/domain/" + domain.id + "/field";

            return fetch(fieldUrl, {
            headers: { "Authorization": 'Bearer ' + this.$store.getters.serverAccessToken },
            method: "GET"
            })
            .then(response => response.json())
            .then(response => response.result)
            .catch(error => {
            console.error("Error fetching fields for domain id", domain.id, ":", error);
            return null;
            });
        });

        Promise.all(fieldRequests)
        .then(fieldResults => {
            fieldResults.forEach((fields, index) => {
            if (fields !== null) {
                this.domainList[index].fields = fields;
            }
            });
            console.log("Updated Domain list:", this.domainList);
        });
    },

    fetchRole() {
        const url = this.$store.getters.serverUrl + "/rolelist";

        fetch(url, {
          "headers" : { "Authorization": 'Bearer ' + this.$store.getters.serverAccessToken },
          "method": "GET"
        }).then(response => {
          return response.json()
        }).then(response => {
          this.roleList = response.result;
          console.log("list", this.roleList);
        })
      }, 

      removeData() {
        this.$refs.login.refresh(this.removeDataCB);
      },
      removeDataCB() {
        var url = this.$store.getters.serverUrl + "/useredit/"+this.form.id;
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
          this.$router.push('/usersetting');
      },
    },
    created() {
    },
    mounted() {
        this.fetchDomains();
        this.fetchRole();
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