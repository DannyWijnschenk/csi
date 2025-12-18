<template>
  <div v-show="showLogin">
    <login-dialog
      ref="login"
      title="Login Server"
      @loggedin="loggedin"
    />
  </div>
  <br />
  <div class="ps-2 pe-2">
    <div
      class="container-fluid card ps-2"
      v-if="$store.getters.isLoggedIn"
    >
      <div class="card-header">
        <div v-if="title">
          <b>{{ title }}</b>
        </div>
        <div
          v-if="error"
          class="alert alert-danger"
        >
          <b>{{ error }}</b>
        </div>
      </div>

      <div class="card-body">
        <div class="row mb-3">
          <div class="col-md-12 d-flex flex-wrap align-items-end gap-2">
            <div class="me-2">
              <label class="form-label mb-1">User</label>
              <select
                v-model="filter.user"
                class="form-select form-select-sm"
              >
                <option value="">All</option>
                <option
                  v-for="u in users"
                  :key="u.initials"
                  :value="u.initials"
                >
                  {{ u.initials }}
                </option>
              </select>
            </div>

            <div class="me-2">
              <label class="form-label mb-1">From</label>
              <input
                v-model="filter.from"
                type="date"
                class="form-control form-control-sm"
              />
            </div>

            <div class="me-2">
              <label class="form-label mb-1">Until</label>
              <input
                v-model="filter.until"
                type="date"
                class="form-control form-control-sm"
              />
            </div>

            <div class="form-check me-3">
              <input
                id="groupByDay"
                v-model="filter.group"
                type="checkbox"
                class="form-check-input"
              />
              <label
                class="form-check-label"
                for="groupByDay"
              >
                Group by Day
              </label>
            </div>

            <button
              type="button"
              class="btn btn-sm btn-secondary me-3"
              @click="getAudit(true)"
            >
              <span class="glyphicon glyphicon-search" aria-hidden="true"></span>
              Refresh
            </button>

            <div class="flex-grow-1">
              <label class="form-label mb-1">Filter</label>
              <input
                v-model="auditFilter"
                type="text"
                class="form-control form-control-sm"
                placeholder="Type to filter..."
              />
            </div>
          </div>
        </div>

        <div v-if="!filter.group">
          <div class="table-responsive">
            <table class="table table-hover table-sm">
              <thead>
                <tr>
                  <th @click="sortBy('date')" role="button">
                    Date
                    <i
                      :class="{
                        'glyphicon glyphicon-chevron-up': sortField === 'date' && !sortDesc,
                        'glyphicon glyphicon-chevron-down': sortField === 'date' && sortDesc
                      }"
                    ></i>
                  </th>
                  <th @click="sortBy('user')" role="button">
                    User
                    <i
                      :class="{
                        'glyphicon glyphicon-chevron-up': sortField === 'user' && !sortDesc,
                        'glyphicon glyphicon-chevron-down': sortField === 'user' && sortDesc
                      }"
                    ></i>
                  </th>
                  <th @click="sortBy('event')" role="button">
                    Event
                    <i
                      :class="{
                        'glyphicon glyphicon-chevron-up': sortField === 'event' && !sortDesc,
                        'glyphicon glyphicon-chevron-down': sortField === 'event' && sortDesc
                      }"
                    ></i>
                  </th>
                  <th @click="sortBy('parameters')" role="button">
                    Parameters
                    <i
                      :class="{
                        'glyphicon glyphicon-chevron-up': sortField === 'parameters' && !sortDesc,
                        'glyphicon glyphicon-chevron-down': sortField === 'parameters' && sortDesc
                      }"
                    ></i>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="audit in filteredAudits" :key="audit.id || audit._key">
                  <td>{{ audit.date }}</td>
                  <td>{{ audit.user }}</td>
                  <td>{{ audit.event }}</td>
                  <td>{{ audit.parameters }}</td>
                </tr>
                <tr v-if="!loading && filteredAudits.length === 0">
                  <td colspan="4" class="text-center text-muted">
                    No audit entries found.
                  </td>
                </tr>
                <tr v-if="loading">
                  <td colspan="4" class="text-center text-muted">
                    Loading...
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div v-else>
          <div class="table-responsive">
            <table class="table table-hover table-sm">
              <thead>
                <tr>
                  <th>User</th>
                  <th v-for="col in auditHeader" :key="col.label">
                    {{ col.label }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in auditList" :key="row.user">
                  <td>{{ row.user }}</td>
                  <td v-for="(col, idx) in row.cols" :key="idx">
                    {{ col.value }}
                  </td>
                </tr>
                <tr v-if="!loading && auditList.length === 0">
                  <td :colspan="(auditHeader?.length || 0) + 1" class="text-center text-muted">
                    No grouped audit data.
                  </td>
                </tr>
                <tr v-if="loading">
                  <td :colspan="(auditHeader?.length || 0) + 1" class="text-center text-muted">
                    Loading...
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import LoginDialog from '@/components/LoginDialog.vue'

export default {
  components: {
    LoginDialog
  },
  data() {
    const lastMonth = new Date()
    lastMonth.setDate(1)
    const today = new Date()
    
    return {
      title: 'Audit Log',
      error: '',
      loading: false,
      users: [],
      auditList: [],
      auditHeader: [],
      auditFilter: '',
      sortField: 'date',
      sortDesc: false,
      filter: {
        user: '',
        from: lastMonth.toISOString().split('T')[0],
        until: today.toISOString().split('T')[0],
        group: true
      }
    }
  },
  computed: {
    showLogin() {
      return !this.$store.getters.isLoggedIn
    },
    filteredAudits() {
      const term = (this.auditFilter || '').toLowerCase()
      let list = [...this.auditList]

      if (term) {
        list = list.filter(a =>
          (a.date && String(a.date).toLowerCase().includes(term)) ||
          (a.user && String(a.user).toLowerCase().includes(term)) ||
          (a.event && String(a.event).toLowerCase().includes(term)) ||
          (a.parameters && String(a.parameters).toLowerCase().includes(term))
        )
      }

      list.sort((a, b) => {
        const va = a[this.sortField]
        const vb = b[this.sortField]
        if (va == null && vb == null) return 0
        if (va == null) return this.sortDesc ? 1 : -1
        if (vb == null) return this.sortDesc ? -1 : 1
        if (va < vb) return this.sortDesc ? 1 : -1
        if (va > vb) return this.sortDesc ? -1 : 1
        return 0
      })

      return list
    }
  },
  methods: {
    loggedin() {
    },
    sortBy(field) {
      if (this.sortField === field) {
        this.sortDesc = !this.sortDesc
      } else {
        this.sortField = field
        this.sortDesc = false
      }
    },
    async getUsers() {
      try {
        const url = this.$store.getters.serverUrl + '/csi/userlist'
        const response = await fetch(url, {
          headers: {
            'Authorization': 'Bearer ' + this.$store.getters.serverAccessToken
          },
          method: 'GET'
        })
        
        if (response.status === 401) {
          this.$store.dispatch('logOut')
          return
        }
        
        if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`)
        }
        
        const data = await response.json()
        this.error = ''
        this.users = data.result || []
      } catch (e) {
        console.error(e)
        this.error = 'Error loading users: ' + e.message
      }
    },
    async getAudit() {
      this.loading = true
      this.error = ''
      try {
        const url = this.$store.getters.serverUrl + '/csi/audit'
        
        const filterData = {
          user: this.filter.user || '',
          from: this.filter.from ? new Date(this.filter.from).toISOString().split('T')[0] : '',
          until: this.filter.until ? new Date(this.filter.until).toISOString().split('T')[0] : '',
          group: this.filter.group || false
        }
        
        const response = await fetch(url, {
          headers: {
            'Authorization': 'Bearer ' + this.$store.getters.serverAccessToken,
            'Content-Type': 'application/json'
          },
          method: 'POST',
          body: JSON.stringify(filterData)
        })
        
        if (response.status === 401) {
          this.$store.dispatch('logOut')
          return
        }
        
        if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`)
        }
        
        const data = await response.json()
        this.error = ''
        this.auditList = data.audit || []
        this.auditHeader = data.header || []
        console.log('auditHeader', this.auditHeader)
      } catch (e) {
        console.error(e)
        this.error = 'Error loading audit data: ' + e.message
      } finally {
        this.loading = false
      }
    }
  },
  mounted() {
    this.getUsers()
    this.getAudit()
  }
}
</script>

<style scoped>
.form-label {
  font-weight: 600;
  font-size: 0.8rem;
}

.table-hover tbody tr:hover {
  background-color: #f5f5f5;
}
</style>


