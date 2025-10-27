<template>
  <div class="tables">
    <div class="page-header">
      <h2 class="page-title">Tables</h2>

      <div class="search-bar">
        <i class="fa-solid fa-magnifying-glass"></i>
        <input v-model="criteria" type="text" placeholder="Search..." />
      </div>
    </div>

    <table class="table table-hover">
      <thead>
        <tr>
          <th @click="sort('name')">
            Table name
            <i :class="sortIcon('name')"></i>
          </th>
          <th @click="sort('textField')">
            Text Field
            <i :class="sortIcon('textField')"></i>
          </th>
          <th @click="openModal('(new)')" class="add-button">
            <i class="fa-solid fa-plus"></i>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="t in filteredTables" :key="t.id">
          <td>{{ t.name }}</td>
          <td>{{ t.textField }}</td>
          <td @click="openModal(t.id)">
            <i class="fa-solid fa-pen-to-square"></i>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-dialog" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">
            Table {{ table.id && table.id !== "(new)" ? "(Edit)" : "(New)" }}
          </h3>
        </div>

        <div
          class="modal-body custom-scroll"
          style="height: 80vh; overflow-y: auto"
        >
          <div class="row mb-2 mt-2">
            <label class="col-md-2 control-label">Name</label>
            <div class="col-md-6">
              <input type="text" class="form-control" v-model="table.name" />
            </div>
          </div>

          <div class="row mb-2">
            <label class="col-md-2 control-label">Text Field</label>
            <div class="col-md-6">
              <input
                type="text"
                class="form-control"
                v-model="table.textField"
              />
            </div>
          </div>

          <div class="table-scroll">
            <table class="table table-bordered mt-3">
              <thead
                class="table-light"
                style="position: sticky; top: 0; z-index: 1"
              >
                <tr>
                  <th>Field Name</th>
                  <th>Metadata Name</th>
                  <th>Operators</th>
                  <th>Datatype</th>
                  <th>Store</th>
                  <th class="text-center">
                    <i
                      class="fa-solid fa-plus add-button"
                      @click="addMeta"
                      style="cursor: pointer"
                    ></i>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(field, idx) in table.metadata" :key="idx">
                  <td>
                    <input
                      type="text"
                      class="form-control"
                      v-model="field.fieldName"
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      class="form-control"
                      v-model="field.metadataName"
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      class="form-control"
                      v-model="field.operators"
                    />
                  </td>
                  <td>
                    <select class="form-control" v-model="field.datatype">
                      <option
                        v-for="type in datatypes"
                        :key="type"
                        :value="type"
                      >
                        {{ type }}
                      </option>
                    </select>
                  </td>
                  <td class="text-center">
                    <input type="checkbox" v-model="field.storeValues" />
                  </td>
                  <td class="text-center">
                    <i
                      class="fa-solid fa-xmark text-danger"
                      @click="deleteMeta(idx)"
                      style="cursor: pointer"
                    ></i>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-primary" @click="save">
            <i class="fa-solid fa-floppy-disk"></i> Save
          </button>
          <button
            v-if="table.id && table.id !== '(new)'"
            type="button"
            class="btn btn-danger"
            @click="remove"
          >
            <i class="fa-solid fa-trash"></i> Delete
          </button>
          <button type="button" class="btn btn-warning" @click="closeModal">
            <i class="fa-solid fa-arrow-left"></i> Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";

const baseUrl = "/api/d2/table";

const tables = ref([]);
const criteria = ref("");
const sortField = ref("");
const reverse = ref(false);
const showModal = ref(false);
const table = ref({});
const datatypes = ["STRING", "DATE"];
let currentId = null;

onMounted(() => {
  loadTables();
});

async function loadTables() {
  const res = await fetch(baseUrl);
  if (!res.ok) {
    console.error("Failed to load tables");
    return;
  }
  tables.value = await res.json();
}

function sort(field) {
  if (sortField.value === field) reverse.value = !reverse.value;
  else {
    sortField.value = field;
    reverse.value = false;
  }
}
function sortIcon(field) {
  if (sortField.value !== field) return "";
  return reverse.value ? "fa-solid fa-chevron-down" : "fa-solid fa-chevron-up";
}

const filteredTables = computed(() => {
  const f = criteria.value.toLowerCase();
  let list = tables.value.filter((t) =>
    Object.values(t).some((v) => String(v).toLowerCase().includes(f))
  );
  if (sortField.value) {
    list = list.sort((a, b) => {
      const av = a[sortField.value] ?? "";
      const bv = b[sortField.value] ?? "";
      return reverse.value ? bv.localeCompare(av) : av.localeCompare(bv);
    });
  }
  return list;
});

async function openModal(id) {
  currentId = id;
  showModal.value = true;
  if (id && id !== "(new)") {
    const res = await fetch(`${baseUrl}/${id}`);
    if (res.ok) {
      table.value = await res.json();
    }
  } else {
    table.value = {
      id: "(new)",
      name: "",
      textField: "",
      metadata: [],
    };
  }
}

function closeModal() {
  showModal.value = false;
}

async function save() {
  const method = table.value.id === "(new)" ? "POST" : "POST";
  const res = await fetch(`${baseUrl}/${table.value.id}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(table.value),
  });
  if (!res.ok) {
    alert("Error saving table");
    return;
  }
  showModal.value = false;
  loadTables();
}

async function remove() {
  if (!currentId || currentId === "(new)") return;
  const confirmed = window.confirm(
    "Are you sure you want to delete this table?"
  );
  if (!confirmed) return;

  const res = await fetch(`${baseUrl}/${currentId}`, { method: "DELETE" });
  if (!res.ok) {
    alert("Error deleting table");
    return;
  }
  showModal.value = false;
  loadTables();
}

function addMeta() {
  table.value.metadata.push({
    fieldName: "",
    metadataName: "",
    operators: "",
    datatype: "STRING",
    storeValues: false,
  });
}
function deleteMeta(index) {
  table.value.metadata.splice(index, 1);
}
</script>

<style>
.table th {
  cursor: pointer;
}
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1.5rem;
  margin-bottom: 1rem;
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
  width: 1000px !important;
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
.add-button {
  cursor: pointer;
}

.modal-body::-webkit-scrollbar,
.table-scroll::-webkit-scrollbar {
  width: 8px;
}

.modal-body::-webkit-scrollbar-thumb,
.table-scroll::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.25);
  border-radius: 4px;
}

.modal-body::-webkit-scrollbar-thumb:hover,
.table-scroll::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.4);
}

.modal-body::-webkit-scrollbar-track,
.table-scroll::-webkit-scrollbar-track {
  background: transparent;
  margin: 4px 0;
}

.modal-body {
  overflow-x: hidden !important;
}

.table-scroll {
  overflow-y: auto;
  overflow-x: hidden; 
  width: 100%;    
}
</style>
