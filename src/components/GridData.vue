<!-- GridData v 1.0.3 08/12/2023 : play, stop, none -->
<template>
    <div v-show=showLogin> 
      <login-dialog ref="login" title="Login Server" v-on:loggedin="loggedin"></login-dialog>
    </div>
    <div class="col-md-12" v-if='this.$store.getters.isLoggedIn'>
      <div class="panel panel-default">
        <div class="panel-header">
          <div v-if="((title!='') && (title != null) && (title !== undefined))" class="alert alert-info">
            <b>{{title}}</b>
            &nbsp;<button v-if="exportCsv==true" v-on:click="exportToCsv()"> Export CSV </button>
         </div>
          <div v-if="((error!='') && (error != null) && (error !== undefined))" class="alert alert-danger">
            <b>{{error}}</b>
          </div>
          <button v-if="(pagination!==null) && (pagination.currentPage!==undefined) && (pagination.totalPages>1)" :disabled="pagination.previousPageLink==undefined" v-on:click="prevPage()"> <font-awesome-icon icon="fa-solid fa-angle-left"/> </button>
          <span v-if="(pagination!==null) && (pagination.currentPage!==undefined) && (pagination.totalPages>1)">&nbsp; pag. {{pagination.currentPage}}/{{pagination.totalPages}}</span>&nbsp;
          <button v-if="(pagination!==null) && (pagination.currentPage!==undefined) && (pagination.totalPages>1)" :disabled="pagination.nextPageLink==undefined" v-on:click="nextPage()"> <font-awesome-icon icon="fa-solid fa-angle-right"/> </button>
        </div>
        <div class="panel-body" v-show="access">
          <table class="table table-striped table-hover">
            <thead>
              <tr>
                <th v-for="column in header" :key="column" v-on:click="sortColumn(column)">
                  <span v-if="(typeof column === 'object')">
                    <button v-if="column.button== 'add'" class="btn btn-outline-primary btn-xs" v-on:click="clickRow('add')" title="toevoegen"><font-awesome-icon icon="fa-solid fa-plus"/></button>
                    <button v-if="column.button== 'refresh'" class="btn btn-outline-primary btn-xs" v-on:click="clickRow('refresh')" title="verversen"><font-awesome-icon icon="fa-solid fa-rotate"/></button>
                    <button v-if="column.button== 'edit'" class="btn btn-outline-primary btn-xs" v-on:click="clickRow('edit')" title="wijzigen"><font-awesome-icon icon="fa-regular fa-pen-to-square"/></button>
                    <button v-if="column.button== 'select'" class="btn btn-outline-primary btn-xs" v-on:click="clickRow('select')" title="selecteren"><font-awesome-icon icon="fa-regular fa-thumbs-up"/></button>
                    <span v-if="(column.icon =='add')"><font-awesome-icon icon="fa-solid fa-plus" /></span>
                    <span v-if="(column.icon =='refresh')"><font-awesome-icon icon="fa-solid fa-rotate" /></span>
                    <span v-if="(column.icon =='edit')"><font-awesome-icon icon="fa-regular fa-pen-to-square" /></span>
                    <span v-if="(column.icon =='select')"><font-awesome-icon icon="fa-regular fa-thumbs-up" /></span>
                  </span>
                  <span v-else>{{column}}</span>
                  <span v-if="column==sortKey">
                    <span v-if="sortDirection==-1" style="margin-left: 0.5em;"><font-awesome-icon icon="fa-solid fa-sort-down" /></span>
                    <span v-if="sortDirection==1" style="margin-left: 0.5em;"><font-awesome-icon icon="fa-solid fa-sort-up" /></span>
                  </span>
                  <span v-else>
                    <span v-if="isSortColumn(column)" style="margin-left: 0.5em;"><font-awesome-icon icon="fa-solid fa-up-down" /></span>
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in results" :key="row">
                <td v-for="value of row" :key="value">
                  <span v-if="(typeof value === 'object')">
                    <button v-if="value.button== 'add'" class="btn btn-outline-primary btn-xs" v-on:click="clickRow('add',value.value)" title="toevoegen"><font-awesome-icon icon="fa-solid fa-plus"/></button>
                    <button v-if="value.button== 'refresh'" class="btn btn-outline-primary btn-xs" v-on:click="clickRow('refresh',value.value)" title="verversen"><font-awesome-icon icon="fa-solid fa-rotate"/></button>
                    <button v-if="value.button== 'edit'" class="btn btn-outline-primary btn-xs" v-on:click="clickRow('edit',value.value)" title="wijzigen"><font-awesome-icon icon="fa-regular fa-pen-to-square"/></button>
                    <button v-if="value.button== 'select'" class="btn btn-outline-primary btn-xs" v-on:click="clickRow('select',value.value)" title="selecteren"><font-awesome-icon icon="fa-regular fa-thumbs-up"/></button>
                    <button v-if="value.button== 'start'" class="btn btn-outline-primary btn-xs" v-on:click="clickRow('start',value.value)" title="starten"><font-awesome-icon icon="fa-solid fa-play"/></button>
                    <button v-if="value.button== 'stop'" class="btn btn-outline-primary btn-xs" v-on:click="clickRow('stop',value.value)" title="stoppen"><font-awesome-icon icon="fa-solid fa-stop"/></button>
                    <button v-if="value.button== 'start-disabled'" class="btn btn-outline-primary btn-xs" disabled ><font-awesome-icon icon="fa-solid fa-play"/></button>
                    <button v-if="value.button== 'stop-disabled'" class="btn btn-outline-primary btn-xs" disabled><font-awesome-icon icon="fa-solid fa-stop"/></button>
                    <span v-if="(value.icon =='edit')"><font-awesome-icon icon="fa-solid fa-plus" /></span>
                    <span v-if="(value.icon =='refresh')"><font-awesome-icon icon="fa-solid fa-rotate" /></span>
                    <span v-if="(value.icon =='add')"><font-awesome-icon icon="fa-regular fa-pen-to-square" /></span>
                    <span v-if="(value.icon =='select')"><font-awesome-icon icon="fa-regular fa-thumbs-up" /></span>
                    <span v-if="(value.icon =='circle')"><font-awesome-icon :style="{color: value.value}" icon="fa-solid fa-circle" /></span>
                  </span>
                  <span v-else>{{value}}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div> <!--panel body -->
      </div>  <!--panel default -->
    </div>  <!--col-md-12-->    
  </template>
  
  <script>
  import LoginDialog from '@/components/LoginDialog.vue'
  export default {
    props: [
      'table', 'titleHeading'
    ],
    emits: [
      'gridClickRow','dataFetched'
    ],
    components: {
      LoginDialog
    },
    computed : {
      showLogin: function () {
        return !this.$store.getters.isLoggedIn;
      }
    },
    data() {
      return {
        results: [ { name:'' } ],
        pagination : { resultKey:"", sortKey:"", sortDirection:""},
        resultKey : '',
        sortKey : '',
        sortDirection : 1,
        sortDescendingChecked : false,
        title:"",
        error : '',
        showSelection : true,
        exportCsv : false,
        access : true,
        header : []
      }
    },  
    methods : {
      loggedin() {
      },
      getData(selection, pageSize, init = false) {
        console.log('with refresh');
        this.$refs.login.refresh( this.getDataCB, [selection, pageSize, init]);
      },
      getDataCB(selection, pageSize, init = false) {
        var url = ""
        if (init) {
          this.resultKey = ''
        }
        if (selection===undefined) {
          url = this.$store.getters.serverUrl+"/grid/"+this.table+ "?selection="
        } else {
          url = this.$store.getters.serverUrl + "/grid/" + this.table + "?selection=" + selection
          if (selection != this.selection) {
            //new selection : we need a new query !
            this.resultKey = '';  //todo : purge the old results, or we need a param to invalidate the results and run the query again
          }
        }
        if (this.sortKey !='') {
          url = url + "&sortKey=" + this.sortKey + "&sortDirection=" + this.sortDirection;
        }
        if (this.resultKey != '') {
          url = url + "&resultKey=" + this.resultKey;
        }
        if (pageSize>0) {
          url = url + "&pageSize=" + pageSize;
        }
        this.selection = selection;
        this.baseUrl=this.server + "/v1/grid/" + this.table 
        this.doFetch(url)
      },
      doFetch(url) {
        console.log('fetch',url);
        this.results = [];
        this.header = [];
        this.title = "Ophalen Gegevens ...";
        fetch(url, {
          "headers" : { "Authorization": 'Bearer ' + this.$store.getters.serverAccessToken },
          "method": "GET"
        }).then(response => { 
           console.log('response grid', response.headers)
           this.pagination = JSON.parse(response.headers.get('X-PAGINATION'));
            if (this.pagination !== null) {
              this.resultKey = this.pagination.resultKey;
              this.sortKey = this.pagination.sortKey;
              this.sortDirection = this.pagination.sortDirection;
              this.sortDescendingChecked = (this.sortDirection == -1);
            }
            //if (response.status == 401) return this.$refs.login.forceRefresh(this.doFetch, [url]);
            if (response.status == 401) this.$store.dispatch('logOut');
            return response.json()  //returns only the response body
          }).then(response => {
            this.results = response.results;
            this.header = response.header;
            this.title = response.title;
            this.showSelection = response.showSelection;
            this.error = response.error;
            if (response.options !== undefined) {
              if (response.options.exportCsv) {
                this.exportCsv = true;
              }
            }
            if (response.access == false) {
              this.access = false;
            }
            this.$emit('dataFetched', this.access);
          });
      },
      nextPage() {
        var url = this.$store.getters.serverUrl+"/v1/grid/"+this.table + this.pagination.nextPageLink;
        this.doFetch(url);
      },
      prevPage() {
        var url = this.$store.getters.serverUrl+"/v1/grid/"+this.table + this.pagination.previousPageLink;
        this.doFetch(url);
      },
      sort() {
        console.log('sort on ',this.sortKey);
        this.getData(this.selection) 
      },
      isSortColumn(column) {
        var found = false;
        if ((this.pagination !== null) && (this.pagination.sortLabels !== undefined)) {
          for (var i=0;i<this.pagination.sortLabels.length;i++) {
            if (column==this.pagination.sortLabels[i]) {
              found = true;
              return found
            }
          }
        }
        return found
      },
      sortColumn(column) {
        if (!this.isSortColumn(column)) return
        if (this.sortKey==column) {
          this.toggleDirection();
        } else {
          this.sortKey = column;
          this.sortDirection = 1;
          this.getData(this.selection)
        }
      },
      toggleDirection() {
        if (this.sortDescendingChecked) {
          this.sortDescendingChecked = false;
          this.sortDirection = 1
        } else {
          this.sortDescendingChecked = true;
          this.sortDirection = -1
        }
        this.sort();
      },
      clickRow(buttonName, buttonId) {
        this.$emit('gridClickRow', buttonName, buttonId);
      },
      exportToCsv() {
        var filename = 'export.csv';
        var processRow = function (row) {
          var finalVal = '';
          for (var j = 0; j < row.length; j++) {
            var innerValue = row[j] === null ? '' : row[j].toString();
            if (row[j] instanceof Date) {
              innerValue = row[j].toLocaleString();
            }
            var result = innerValue.replace(/"/g, '""');
            if (result.search(/("|,|\n)/g) >= 0)
              result = '"' + result + '"';
            if (j > 0)
              finalVal += ',';
            finalVal += result;
          }
          return finalVal + '\n';
        };
   
        var csvFile = '';
        for (var i = 0; i < this.results.length; i++) {
          csvFile += processRow(this.results[i]);
        }
   
        var blob = new Blob([csvFile], { type: 'text/csv;charset=utf-8;' });
        if (navigator.msSaveBlob) { // IE 10+
          navigator.msSaveBlob(blob, filename);
        } else {
          var link = document.createElement("a");
          if (link.download !== undefined) { // feature detection
            // Browsers that support HTML5 download attribute
            var url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }
        }
      }
   }
  
  }
  </script>