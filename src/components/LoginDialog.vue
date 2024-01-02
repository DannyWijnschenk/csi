<template>
    <div class="col-md-12 d-flex justify-content-center">
      <div class="card">
        <div class="card-header">
          <h5>{{title}} {{ott}}</h5>
        </div>
        <div class="card-body">
          <div class="form-group row" >
            <label for="user" class="col-md-4">User</label>
            <div class="col-md-8">
              <input class="form-control" v-model="user"/>
            </div>
          </div>
          <div class="form-group row">
            <label for="password" class="col-md-4">Password</label>
              <div class="col-md-8">
                <input type="password" class="form-control" v-model="password" @keyup.enter="login()">
              </div>
          </div>
          <div class="form-group row" v-if="(error!=='')&&(error!==undefined)"><br/><span class="alert alert-danger">{{error}}</span></div>
        </div> <!-- card body -->
        <div class="card-footer">
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
        var url = this.$store.getters.serverUrl + "/token";
        fetch(url, {
          "method": "GET",			  
          "headers" : { "authorization": 'basic ' + btoa(this.user+':'+this.password), "app": this.$store.getters.appName }
        }).then(response => { 
          console.log('token',response.token)
          if ((response.status != 200) || (response.status != 201) || (response.token===undefined)) {
            this.error = 'Invalid login'
          }
          return response.json()
        }).then(response => {
          if ((response.token !== '') && (response.token !== undefined)) {
            this.accessToken = response.token;
            this.refreshToken = response.refreshToken;
            this.accessTokenExpiresAt = response.accessTokenExpiresAt;
            this.refreshTokenExpiresAt = response.refreshTokenExpiresAt;
            this.context = response.context;
            this.$store.dispatch('saveToken', {
                 user: this.user,
                 userAccessCode: this.userAccessCode,
                 accessToken: this.accessToken,
                 refreshToken: this.refreshToken,
                 accessTokenExpiresAt: this.accessTokenExpiresAt,
                 refreshTokenExpiresAt: this.refreshTokenExpiresAt
              })
            console.log('emit loggedin');
            this.$emit('loggedin');
            this.step = ''
            this.password = ''
          } else {
            console.log('error', response.error)
          }
        });
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