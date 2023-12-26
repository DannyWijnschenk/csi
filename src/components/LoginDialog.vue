<template>
    <div class="col-md-12 d-flex justify-content-center">
      <div class="card">
        <div class="card-header">
          <h5>{{title}} {{ott}}</h5>
        </div>
        <div class="card-body"  v-if="(ott===undefined)||(ott=='')">
          <div class="form-group row" >
            <label for="user" class="col-md-4">Gebruiker</label>
            <div class="col-md-8">
              <input v-if="step!=='access'" class="form-control" v-model="user"/>
              <input v-if="step=='access'" class="form-control" v-model="user" readonly/>
            </div>
          </div>
          <div class="form-group row" v-if="step!=='access'">
            <label for="password" class="col-md-4">Paswoord</label>
              <div class="col-md-8">
                <input type="password" class="form-control" v-model="password" @keyup.enter="login()">
              </div>
          </div>
          <div class="form-group row" v-if="step=='access'">
            <label for="access" class="col-md-4">Toegang</label>
            <div class="col-md-8">
              <select class="form-select form-select-sm" v-model="userAccessCode" v-on:change="selectAccess();">
                <option v-for="acc in accesses" v-bind:value="acc.userAccessCode" :key="acc.userAccessCode">
                  {{acc.environmentDescription}} {{acc.userAccessCode}}
                </option>
              </select>
            </div>
          </div>
          <div class="form-group row" v-if="(error!=='')&&(error!==undefined)"><br/><span class="alert alert-danger">{{error}}</span></div>
        </div> <!-- card body -->
        <div class="card-footer" v-if="step!=='access'">
          <button class="btn btn-outline-primary" type="button" v-on:click="login();">Login</button>
        </div>
      </div>  <!--card -->
    </div>
  </template>
  
  <script>
  export default {
    props: [
      'title',
      'ott'
    ],
    emits: ['loggedin'],
    data() {
      return {
        status: { message:'Waiting for the result from the server ...', token:'' },
        application: 'null',
        user : '',
        password: '',
        error:'',
        step: '',
        accessToken:'',
        refreshToken:'',
        accessTokenExpiresAt:'',
        refreshTokenExpiresAt:'',
        accesses: [],
        context: {},
        refreshIsCalling: false
      }
    },
    methods : {
      login() {  //login on the server
        var url = this.$store.getters.serverUrl + "/v1/login";
        if (this.ott!==undefined) {  //If a ott is present, we will use this instead of asking user/pw
          url = url + '?ott='+this.ott;  //should already be base64Encoded when used in the url parameter!
        }
        fetch(url, {
          "method": "POST",			  
          "headers" : { "authorization": 'basic ' + btoa(this.user+':'+this.password), "app": this.$store.getters.appName }
        }).then(response => { 
          if ((response.status != 200) || (response.status != 201)) {
            this.error = 'Fout bij inloggen : ' + response.statusText
          }
          return response.json()
        }).then(response => {
          if ((response.accessToken !== '') && (response.accessToken !== undefined)) {
            this.accessToken = response.accessToken;
            this.refreshToken = response.refreshToken;
            this.accessTokenExpiresAt = response.accessTokenExpiresAt;
            this.refreshTokenExpiresAt = response.refreshTokenExpiresAt;
            this.context = response.context;
            if (this.ott != undefined) {
              this.access = response.userAccessCode;
              this.selectAccess();
            } else {
              if (response.userAccessCodes.length == 0) {
                this.error = "Geen toegang tot deze applicatie"
                this.step = ''
              } else {
                this.accesses = response.userAccessCodes;
                this.userAccessCode = '';
                this.step = 'access';
                this.error = '';
              }
            }
          } else {
            console.log('error', response.error)
            if (this.ott != undefined) {
               //this.ott = undefined;  //will display the login again to let the user login 'manually'
            } else {
              if (response.errors !== undefined) {
                this.error = 'server fout'
              } else {
                this.error = response.error; //'gebruiker/wachtwoord combinatie is onbekend';
              }
            }
          }
        });
      },
      selectAccess() {
        var url = this.$store.getters.serverUrl + "/v1/login/uac";
        fetch(url, {
          "method": "POST",			  
          "headers" : { "authorization": 'Bearer ' + this.accessToken, "app": this.$store.getters.appName },
          "body"    : JSON.stringify({"userAccessCode" : this.userAccessCode})
        }).then(response => { 
          return response.json()
        })
        this.$store.dispatch('saveToken', {
          user: this.user,
          userAccessCode: this.userAccessCode,
          accessToken: this.accessToken,
          refreshToken: this.refreshToken,
          accessTokenExpiresAt: this.accessTokenExpiresAt,
          refreshTokenExpiresAt: this.refreshTokenExpiresAt
        })
        this.getRights('patients');
        console.log('emit loggedin');
        this.$emit('loggedin');
        this.step = ''
        this.password = ''
      },
      selectRefresh() {
          this.$emit('loggedin');
      },
    forceRefresh(callBack, args) {
        this.refreshIsCalling = true;
              console.log('refresh access token');
              fetch(this.$store.getters.serverUrl + "/v1/refresh", {
                  "headers": { "authorization": 'Bearer ' + this.$store.getters.serverAccessToken },
                  "body": JSON.stringify({ "refreshToken": this.$store.getters.serverRefreshToken }),
                  "method": "POST"
              }).then(response => {
                  if (response.status != 200) {
                      this.$store.dispatch('logOut');  //if refresh fails, user has to login again
            this.refreshIsCalling = false;
                  } else {
                      return response.json()
                  }
              }).then(response => {
                  this.$store.dispatch('refreshToken', { 'accessToken': response.accessToken, 'accessTokenExpiresAt': response.accessTokenExpiresAt });
                  //this.selectRefresh();
                  if ((callBack != "") && (callBack != undefined) && (callBack != null)) {
            console.log('callback after refresh', args)
            if ((args == undefined)) {
              callBack();
              console.log("without params")
            } else {
              callBack.apply(this, args);
              console.log("with params")
            }
          }
          this.refreshIsCalling = false;
              })
    },
      refresh(callBack, args) {
          var now = new Date();
          var expireDate = new Date(this.$store.getters.serverAccessTokenExpiresAt);
          expireDate = new Date(expireDate.getTime() - (30000));  ///substract 30 seconds to be on the safe side
      console.log('refresh token')
      console.log('now', now.toLocaleString())
      console.log('exp', expireDate.toLocaleString())
      console.log('exp < now',expireDate < now)
      if ((expireDate < now) && (!this.refreshIsCalling)) {  //if it is about to expire in 30 seconds
        this.forceRefresh(callBack, args)
          } else {
              if ((callBack != "") && (callBack != undefined) && (callBack != null)) {
          if (args == undefined) {
            callBack();
          } else {
            callBack.apply(this, args);
          }
          console.log('callback')
              }
          }
      },
    getRights(right) {
       var url = this.$store.getters.serverUrl + "/v1/accessrights";
        var body = {"application" : this.$store.getters.appName+'.'+right}
          fetch(url, {
            "headers" : { "Authorization": 'Bearer ' + this.$store.getters.serverAccessToken },
            "method": "POST",
            "body" : JSON.stringify(body)
          }).then(response => {
            return response.json() 
          }).then(response => {
            this.message = response.message;
            this.error = response.error;
            if (response.hasAccess) {
              this.$store.dispatch('setRights', right);
              console.log('rights',response.hasAccess)
              console.log('rights patients', this.$store.getters.getRights);
            } else {
              console.log('no rights', response)
            }
          });
        },
      }, 
    mounted() {
      if (this.ott!==undefined) {  //If a ott is present, we will use this instead of asking user/pw
      console.log('login using ott');
      this.login();
      }
    }
  }
  </script>