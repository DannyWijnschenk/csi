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
          <div class="col-md-12 d-flex align-items-end gap-2">
            <div class="flex-grow-1">
              <label class="form-label mb-1">Filter</label>
              <input
                v-model="taskFilter"
                type="text"
                class="form-control form-control-sm"
                placeholder="Type to filter..."
              />
            </div>
            <button
              type="button"
              class="btn btn-sm btn-secondary"
              @click="getTasks(true)"
            >
              <span
                class="glyphicon glyphicon-refresh"
                aria-hidden="true"
              ></span>
              Refresh
            </button>
          </div>
        </div>

        <div class="table-responsive">
          <table class="table table-hover table-sm">
            <thead>
              <tr>
                <th @click="sortBy('queueName')" role="button">
                  Queue
                  <i
                    :class="{
                      'glyphicon glyphicon-chevron-up': sortField === 'queueName' && !sortDesc,
                      'glyphicon glyphicon-chevron-down': sortField === 'queueName' && sortDesc
                    }"
                  ></i>
                </th>
                <th @click="sortBy('description')" role="button">
                  Description
                  <i
                    :class="{
                      'glyphicon glyphicon-chevron-up': sortField === 'description' && !sortDesc,
                      'glyphicon glyphicon-chevron-down': sortField === 'description' && sortDesc
                    }"
                  ></i>
                </th>
                <th @click="sortBy('task')" role="button">
                  Task
                  <i
                    :class="{
                      'glyphicon glyphicon-chevron-up': sortField === 'task' && !sortDesc,
                      'glyphicon glyphicon-chevron-down': sortField === 'task' && sortDesc
                    }"
                  ></i>
                </th>
                <th @click="sortBy('status')" role="button">
                  Status
                  <i
                    :class="{
                      'glyphicon glyphicon-chevron-up': sortField === 'status' && !sortDesc,
                      'glyphicon glyphicon-chevron-down': sortField === 'status' && sortDesc
                    }"
                  ></i>
                </th>
                <th @click="sortBy('started')" role="button">
                  Started
                  <i
                    :class="{
                      'glyphicon glyphicon-chevron-up': sortField === 'started' && !sortDesc,
                      'glyphicon glyphicon-chevron-down': sortField === 'started' && sortDesc
                    }"
                  ></i>
                </th>
                <th @click="sortBy('finished')" role="button">
                  Finished
                  <i
                    :class="{
                      'glyphicon glyphicon-chevron-up': sortField === 'finished' && !sortDesc,
                      'glyphicon glyphicon-chevron-down': sortField === 'finished' && sortDesc
                    }"
                  ></i>
                </th>
                <th @click="sortBy('duration')" role="button">
                  Time
                  <i
                    :class="{
                      'glyphicon glyphicon-chevron-up': sortField === 'duration' && !sortDesc,
                      'glyphicon glyphicon-chevron-down': sortField === 'duration' && sortDesc
                    }"
                  ></i>
                </th>
                <th @click="sortBy('error')" role="button">
                  Error
                  <i
                    :class="{
                      'glyphicon glyphicon-chevron-up': sortField === 'error' && !sortDesc,
                      'glyphicon glyphicon-chevron-down': sortField === 'error' && sortDesc
                    }"
                  ></i>
                </th>
                <th class="text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="task in filteredTasks"
                :key="task.id || task._key"
                :class="rowClass(task.status)"
              >
                <td>{{ task.queueName }}</td>
                <td>{{ task.description }}</td>
                <td>{{ task.task }}</td>
                <td>{{ task.status }}</td>
                <td>{{ task.started }}</td>
                <td>{{ task.finished }}</td>
                <td>{{ task.duration }}</td>
                <td>{{ task.error }}</td>
                <td class="text-nowrap">
                  <a
                    v-if="task.status !== 'Started'"
                    class="icon-link text-danger me-2"
                    role="button"
                    @click="deleteTask(task.id)"
                  >
                    <font-awesome-icon icon="fa-solid fa-trash-can" />
                  </a>
                  <a
                    v-if="task.status === 'Started'"
                    class="icon-link text-warning"
                    role="button"
                    @click="terminateTask(task.id)"
                  >
                    <font-awesome-icon icon="fa-solid fa-bolt-lightning" />
                  </a>
                </td>
              </tr>
              <tr v-if="!loading && filteredTasks.length === 0">
                <td colspan="9" class="text-center text-muted">
                  No tasks found.
                </td>
              </tr>
              <tr v-if="loading">
                <td colspan="9" class="text-center text-muted">
                  Loading...
                </td>
              </tr>
            </tbody>
          </table>
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
    return {
      title: 'Task Queue',
      error: '',
      loading: false,
      tasks: [],
      taskFilter: '',
      sortField: 'queueName',
      sortDesc: false
    }
  },
  computed: {
    showLogin() {
      return !this.$store.getters.isLoggedIn
    },
    filteredTasks() {
      const term = (this.taskFilter || '').toLowerCase()
      let list = [...this.tasks]

      if (term) {
        list = list.filter(t =>
          (t.queueName && String(t.queueName).toLowerCase().includes(term)) ||
          (t.description && String(t.description).toLowerCase().includes(term)) ||
          (t.task && String(t.task).toLowerCase().includes(term)) ||
          (t.status && String(t.status).toLowerCase().includes(term)) ||
          (t.error && String(t.error).toLowerCase().includes(term))
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
      // placeholder – same pattern as other views
    },
    sortBy(field) {
      if (this.sortField === field) {
        this.sortDesc = !this.sortDesc
      } else {
        this.sortField = field
        this.sortDesc = false
      }
    },
    rowClass(status) {
      return {
        success: status === 'Finished',
        danger: status === 'Crashed',
        info: status === 'Started',
        primary: status === 'Queued',
        warning: status === 'Terminated'
      }
    },
    async getTasks() {
      this.loading = true
      this.error = ''
      try {
        const url = this.$store.getters.serverUrl + '/csi/queue/'
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
        this.tasks = data.result || []
      } catch (e) {
        console.error(e)
        this.error = 'Error loading tasks: ' + e.message
      } finally {
        this.loading = false
      }
    },
    async deleteTask(id) {
      if (!id) return
      try {
        const url = this.$store.getters.serverUrl + '/csi/task/' + id
        const response = await fetch(url, {
          headers: {
            'Authorization': 'Bearer ' + this.$store.getters.serverAccessToken
          },
          method: 'DELETE'
        })
        
        if (response.status === 401) {
          this.$store.dispatch('logOut')
          return
        }
        
        if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`)
        }
        
        this.error = ''
        await this.getTasks(true)
      } catch (e) {
        console.error(e)
        this.error = 'Error deleting task: ' + e.message
      }
    },
    async terminateTask(id) {
      if (!id) return
      try {
        const url = this.$store.getters.serverUrl + '/csi/task/' + id + '/terminate'
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
        
        this.error = ''
        await this.getTasks(true)
      } catch (e) {
        console.error(e)
        this.error = 'Error terminating task: ' + e.message
      }
    }
  },
  mounted() {
    this.getTasks()
  }
}
</script>

<style scoped>
.form-label {
  font-weight: 600;
  font-size: 0.8rem;
}

.icon-link {
  cursor: pointer;
}
</style>


