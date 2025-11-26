<template>
  <div class="domain-definitions">
    <div class="page-header">
      <h2 class="page-title">Domain Definitions</h2>

      <div class="search-bar">
        <i class="fa-solid fa-magnifying-glass"></i>
        <input v-model="criteria" type="text" placeholder="Search..." />
      </div>
    </div>

    <table class="table table-hover">
      <thead>
        <tr>
          <th @click="sort('Name')">
            Name, Description
            <i :class="sortIcon('Name')"></i>
          </th>
          <th @click="sort('IndexTable')">
            Table <i :class="sortIcon('IndexTable')"></i>
          </th>
          <th @click="sort('IndexWhere')">
            Where <i :class="sortIcon('IndexWhere')"></i>
          </th>
          <th @click="sort('IndexForEach')">
            ForEach <i :class="sortIcon('IndexForEach')"></i>
          </th>
          <th @click="sort('IndexRange')">
            Range <i :class="sortIcon('IndexRange')"></i>
          </th>
          <th @click="sort('IndexUntil')">
            IndexUntil <i :class="sortIcon('IndexUntil')"></i>
          </th>
          <th @click="sort('Expires')">
            Expires <i :class="sortIcon('Expires')"></i>
          </th>
          <th @click="sort('NextUpdateAction')">
            Next Update <i :class="sortIcon('NextUpdateAction')"></i>
          </th>
          <th @click="sort('Namespace')">
            Namespace <i :class="sortIcon('Namespace')"></i>
          </th>
          <th @click="openModal('(new)')" class="add-button">
            <i class="fa-solid fa-plus"></i>
          </th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="domain in filteredDomains" :key="domain.ID">
          <td>
            {{ domain.Name }}<br /><i>{{ domain.Description }}</i>
          </td>
          <td>{{ domain.IndexTable }}</td>
          <td>{{ domain.IndexWhere }}</td>
          <td>{{ domain.IndexForEach }}</td>
          <td>{{ truncated(domain.IndexRange) }}</td>
          <td>{{ toDate(domain.IndexUntil) }}</td>
          <td>{{ toDate(domain.Expires) }}</td>
          <td>{{ updateAction(domain.NextUpdateAction) }}</td>
          <td>{{ domain.Namespace }}</td>
          <td @click="openModal(domain.ID)">
            <i class="fa-solid fa-pen-to-square"></i>
          </td>
        </tr>
      </tbody>
    </table>

    <div class="pagination">
      <button @click="prevPage" :disabled="page === 1">⟨ Prev</button>
      <span>Page {{ page }}</span>
      <button @click="nextPage" :disabled="!hasMore">Next ⟩</button>
    </div>

    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-dialog" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">
            {{ modalTitle }} {{ domainDefinition.ID }}
          </h3>
        </div>

        <div class="modal-body">
          <div class="row mb-2">
            <label class="col-md-3 control-label">Name</label>
            <div class="col-md-9">
              <input
                type="text"
                class="form-control"
                v-model="domainDefinition.Name"
                placeholder="Text"
              />
            </div>
          </div>

          <div class="row mb-2">
            <label class="col-md-3 control-label">Description</label>
            <div class="col-md-9">
              <textarea
                rows="2"
                class="form-control"
                v-model="domainDefinition.Description"
                placeholder="Description of the domain"
              ></textarea>
            </div>
          </div>

          <div class="row mb-2">
            <label class="col-md-3 control-label">Namespace</label>
            <div class="col-md-9">
              <input
                type="text"
                class="form-control"
                v-model="domainDefinition.Namespace"
                placeholder="Text"
              />
            </div>
          </div>

          <div class="row mb-2">
            <label class="col-md-3 control-label">Table</label>
            <div class="col-md-9">
              <input
                type="text"
                class="form-control"
                v-model="domainDefinition.IndexTable"
                placeholder="Text"
              />
            </div>
          </div>

          <div class="row mb-2">
            <label class="col-md-3 control-label">Where</label>
            <div class="col-md-9">
              <textarea
                rows="2"
                class="form-control"
                v-model="domainDefinition.IndexWhere"
                placeholder="SQL Where"
              ></textarea>
            </div>
          </div>

          <div class="row mb-2">
            <label class="col-md-3 control-label">For Each</label>
            <div class="col-md-9">
              <input
                type="text"
                class="form-control"
                v-model="domainDefinition.IndexForEach"
                placeholder="Column"
              />
            </div>
          </div>

          <div class="row mb-2">
            <label class="col-md-3 control-label">Range</label>
            <div class="col-md-7">
              <textarea
                rows="3"
                class="form-control"
                v-model="domainDefinition.IndexRange"
                placeholder="Values separated by , or upload via file"
              ></textarea>
            </div>
            <div class="col-md-2">
              <label class="btn btn-sm btn-default">
                <i class="fa-solid fa-file" />
                <input
                  type="file"
                  style="display: none"
                  @change="onFileChange"
                />
              </label>
            </div>
          </div>

          <div class="row mb-2">
            <label class="col-md-3 control-label">IndexUntil</label>
            <div class="col-md-4">
              <input
                type="date"
                class="form-control"
                v-model="domainDefinition.IndexUntil"
              />
            </div>
          </div>

          <div class="row mb-2">
            <label class="col-md-3 control-label">Expires</label>
            <div class="col-md-4">
              <input
                type="date"
                class="form-control"
                v-model="domainDefinition.Expires"
              />
            </div>
          </div>

          <div class="row mb-2">
            <label class="col-md-3 control-label">Next Update Action</label>
            <div class="col-md-9">
              <select
                class="form-control"
                v-model="domainDefinition.NextUpdateAction"
              >
                <option :value="1">Rebuild Domain Once</option>
                <option :value="2">Update Domain</option>
                <option :value="3">Always Rebuild Domain</option>
              </select>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-primary" @click="save">
            <i class="fa-solid fa-floppy-disk" /> Save
          </button>
          <button type="button" class="btn btn-danger" @click="remove">
            <i class="fa-solid fa-xmark" /> Delete
          </button>
          <button type="button" class="btn btn-warning" @click="closeModal">
            <i class="fa-solid fa-arrow-left" /> Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "DomainDefinitions",

  data() {
    return {
      domainDefinitions: [],
      criteria: "",
      sortField: "",
      reverse: false,
      showModal: false,
      domainDefinition: {},
      modalTitle: "",
      currentId: null,
      page: 1,
      isLoading: false,
      hasMore: true,
    };
  },

  computed: {
    filteredDomains() {
      const filter = this.criteria.toLowerCase();
      let list = this.domainDefinitions.filter((d) =>
        Object.values(d).some((v) => String(v).toLowerCase().includes(filter))
      );
      if (this.sortField) {
        list = list.sort((a, b) => {
          const av = a[this.sortField] ?? "";
          const bv = b[this.sortField] ?? "";
          return this.reverse ? bv.localeCompare(av) : av.localeCompare(bv);
        });
      }
      return list;
    },
  },

  mounted() {
    this.loadDomains();
  },

  methods: {

    async getDomainDefinitions(page = 1) {
      const res = await fetch(`${this.$store.getters.serverUrl + "/d2/definition"}?page=${page}`);
      if (!res.ok) throw new Error("Failed to load definitions");
      return await res.json();
    },

    async getDomainDefinition(id) {
      const res = await fetch(this.$store.getters.serverUrl + "/d2/definition/" + id);
      if (!res.ok) throw new Error("Failed to load definition");
      return await res.json();
    },

    async updateDomainDefinition(id, data) {
      const res = await fetch(this.$store.getters.serverUrl + "/d2/definition/" + id, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to save definition");
    },

    async deleteDomainDefinition(id) {
      const res = await fetch(this.$store.getters.serverUrl + "/d2/definition/" + id, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete definition");
    },


    async loadDomains() {
      if (this.isLoading) return;
      this.isLoading = true;

      const data = await this.getDomainDefinitions(this.page);

      if (!data.children || data.children.length === 0) {
        this.hasMore = false;
        this.domainDefinitions = [];
      } else {
        this.domainDefinitions = data.children;
        this.hasMore = true;
      }

      this.isLoading = false;
    },

    async nextPage() {
      if (this.isLoading || !this.hasMore) return;
      this.page++;
      await this.loadDomains();
    },

    async prevPage() {
      if (this.page === 1) return;
      this.page--;
      this.hasMore = true;
      await this.loadDomains();
    },


    sort(field) {
      if (this.sortField === field) this.reverse = !this.reverse;
      else {
        this.sortField = field;
        this.reverse = false;
      }
    },

    sortIcon(field) {
      if (this.sortField !== field) return "";
      return this.reverse
        ? "fa-solid fa-chevron-down"
        : "fa-solid fa-chevron-up";
    },


    truncated(text) {
      return text?.length > 40 ? text.substring(0, 40) + "…" : text;
    },

    toDate(str) {
      if (!str) return "";
      return new Date(
        str.substr(6, 4),
        str.substr(0, 2) - 1,
        str.substr(3, 2)
      ).toLocaleDateString();
    },

    updateAction(code) {
      return { 1: "Rebuild once", 2: "Update", 3: "Always Rebuild" }[code] || code;
    },

    convertDate(dateStr) {
      if (!dateStr) return "";
      const parts = dateStr.split("/");
      if (parts.length !== 3) return "";
      const [mm, dd, yyyy] = parts;
      return `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
    },

    async openModal(id) {
      this.currentId = id;
      this.showModal = true;

      if (id && id !== "(new)") {
        this.modalTitle = "Edit Domain Definition";
        const data = await this.getDomainDefinition(id);
        const def = data.children?.[0] ?? {};

        def.IndexUntil = this.convertDate(def.IndexUntil);
        def.Expires = this.convertDate(def.Expires);

        this.domainDefinition = def;
      } else {
        this.modalTitle = "New Domain Definition";
        this.domainDefinition = {
          Name: "",
          Description: "",
          IndexRange: "",
          NextUpdateAction: 1,
        };
      }
    },

    closeModal() {
      this.showModal = false;
    },

    async save() {
      await this.updateDomainDefinition(this.currentId, this.domainDefinition);
      this.showModal = false;
      this.loadDomains();
    },

    async remove() {
      if (!this.currentId || this.currentId === "(new)") {
        this.showModal = false;
        return;
      }
      const confirmed = window.confirm(
        "Are you sure you want to delete this domain?"
      );
      if (!confirmed) return;

      await this.deleteDomainDefinition(this.currentId);
      this.showModal = false;
      this.loadDomains();
    },

    onFileChange(e) {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        let text = reader.result.replace(/[\n\r]/g, ",").replace(/,,/g, ",");
        this.domainDefinition.IndexRange = text;
      };
      reader.readAsText(file);
    },
  },
};
</script>


<style>
.table th {
  cursor: pointer;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 1rem 0;
  gap: 1rem;
}

.pagination button {
  background: #eee;
  border: 1px solid #ccc;
  padding: 0.4rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

.pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.modal-overlay .modal-dialog {
  pointer-events: auto;
  position: relative;
  z-index: 2;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9998;
}

.modal-dialog {
  background: #fff;
  padding: 1.5rem;
  border-radius: 6px;
  width: 800px !important;
  position: relative;
  z-index: 9999;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
}

.modal-footer {
  margin-top: 1.5rem;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  border-top: 1px solid #ddd;
  padding-top: 1rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1.5rem; /* відступ зверху */
  margin-bottom: 1rem; /* трохи простору під заголовком */
  padding: 0 1rem;
}

.page-title {
  font-size: 1.6rem;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.search-bar {
  display: flex;
  align-items: center;
  background: #f7f7f7;
  border: 1px solid #ccc;
  border-radius: 6px;
  padding: 0.4rem 0.8rem;
  transition: box-shadow 0.2s ease;
}

.search-bar:focus-within {
  box-shadow: 0 0 0 2px rgba(100, 150, 250, 0.3);
  border-color: #80b3ff;
}

.search-bar i {
  color: #777;
  margin-right: 0.5rem;
}

.search-bar input {
  border: none;
  outline: none;
  background: transparent;
  font-size: 0.95rem;
  width: 200px;
}
</style>
