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

<script setup>
import { ref, computed, onMounted } from "vue";

const baseUrl = "/api/d2/definition";

async function getDomainDefinitions(page = 1) {
  const res = await fetch(`${baseUrl}?page=${page}`);
  if (!res.ok) throw new Error("Failed to load definitions");
  return await res.json();
}

async function getDomainDefinition(id) {
  const res = await fetch(baseUrl + "/" + id);
  if (!res.ok) throw new Error("Failed to load definition");
  return await res.json();
}

async function updateDomainDefinition(id, data) {
  const res = await fetch(baseUrl + "/" + id, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to save definition");
  return;
}

async function deleteDomainDefinition(id) {
  const res = await fetch(baseUrl + "/" + id, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete definition");
  return;
}

const domainDefinitions = ref([]);
const criteria = ref("");
const sortField = ref("");
const reverse = ref(false);
const showModal = ref(false);
const domainDefinition = ref({});
const modalTitle = ref("");
let currentId = null;
let page = 1;
let isLoading = false;
let hasMore = true;

onMounted(() => {
  loadDomains();
});

async function loadDomains() {
  if (isLoading) return;
  isLoading = true;

  const data = await getDomainDefinitions(page);

  if (!data.children || data.children.length === 0) {
    hasMore = false;
    domainDefinitions.value = [];
  } else {
    domainDefinitions.value = data.children;
    hasMore = true;
  }

  isLoading = false;
}

async function nextPage() {
  if (isLoading || !hasMore) return;
  page++;
  await loadDomains();
}

async function prevPage() {
  if (page === 1) return;
  page--;
  hasMore = true;
  await loadDomains();
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

const filteredDomains = computed(() => {
  const filter = criteria.value.toLowerCase();
  let list = domainDefinitions.value.filter((d) =>
    Object.values(d).some((v) => String(v).toLowerCase().includes(filter))
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

function truncated(text) {
  return text?.length > 40 ? text.substring(0, 40) + "…" : text;
}
function toDate(str) {
  if (!str) return "";
  return new Date(
    str.substr(6, 4),
    str.substr(0, 2) - 1,
    str.substr(3, 2)
  ).toLocaleDateString();
}
function updateAction(code) {
  return { 1: "Rebuild once", 2: "Update", 3: "Always Rebuild" }[code] || code;
}

function convertDate(dateStr) {
  if (!dateStr) return "";
  const parts = dateStr.split("/");
  if (parts.length !== 3) return "";
  const [mm, dd, yyyy] = parts;
  return `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
}

async function openModal(id) {
  currentId = id;
  showModal.value = true;
  if (id && id !== "(new)") {
    modalTitle.value = "Edit Domain Definition";
    const data = await getDomainDefinition(id);
    const def = data.children?.[0] ?? {};

    def.IndexUntil = convertDate(def.IndexUntil);
    def.Expires = convertDate(def.Expires);

    domainDefinition.value = def;
  } else {
    modalTitle.value = "New Domain Definition";
    domainDefinition.value = {
      Name: "",
      Description: "",
      IndexRange: "",
      NextUpdateAction: 1,
    };
  }
}
function closeModal() {
  showModal.value = false;
}
async function save() {
  await updateDomainDefinition(currentId, domainDefinition.value);
  showModal.value = false;
  loadDomains();
}
async function remove() {
  if (!currentId || currentId === "(new)") {
    showModal.value = false;
    return;
  }
  const confirmed = window.confirm(
    "Are you sure you want to delete this domain?"
  );
  if (!confirmed) {
    return;
  }
  await deleteDomainDefinition(currentId);
  showModal.value = false;
  loadDomains();
}

function onFileChange(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    let text = reader.result.replace(/[\n\r]/g, ",").replace(/,,/g, ",");
    domainDefinition.value.IndexRange = text;
  };
  reader.readAsText(file);
}
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
