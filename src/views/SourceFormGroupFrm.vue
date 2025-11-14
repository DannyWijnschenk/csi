<template>
  <div class="group-editor">
    <div class="card p-4">
      <h3>Group</h3>
      <input
        v-model="groupName"
        type="text"
        class="form-control mb-3"
        placeholder="Enter group name"
      />

      <h4>SourceForms</h4>

      <div v-if="selectedForms.length === 0" class="text-muted">
        No SourceForms selected
      </div>
      <ul v-else class="selected-list">
        <li
          v-for="(sf, index) in selectedForms"
          :key="sf.sourceForm"
          class="item-row"
        >
          <span class="item-text">{{ sf.sourceForm }}</span>
          <button
            class="btn btn-sm btn-outline-danger delete-btn"
            @click="removeForm(index)"
          >
            Delete
          </button>
        </li>
      </ul>

      <div class="row mb-2">
        <div class="col-sm-5">
          <button
            type="button"
            class="btn btn-outline-primary"
            v-on:click="saveGroup()"
          >
            Save Group</button
          >&nbsp;
          <button
            type="button"
            class="btn btn-outline-secondary"
            v-on:click="goBack()"
          >
            Back</button
          >&nbsp;
        </div>
      </div>
    </div>

    <div v-if="showTree" class="tree-container card mt-4 p-3">
      <h4>Select SourceForms</h4>
      <ul class="ms-4 outer-grid">
        <li v-for="(group, prefix) in groupedForms" :key="prefix">
          <div class="d-flex align-items-center">
            <button class="btn btn-sm" @click="toggle(prefix)">
              {{ expanded[prefix] ? "[-]" : "[+]" }}
            </button>
            <input
              type="checkbox"
              :checked="isGroupSelected(prefix)"
              @change="toggleGroup(prefix)"
            />
            <b class="ms-2">
            {{ prefix }}
            <span v-if="Object.keys(formsInGroup).some(k => k.startsWith(prefix))">*</span>
            </b>
            <span class="ms-2 text-secondary small">
              ({{ countSelected(prefix) }}/{{ group.length }})
            </span>
          </div>

          <ul v-show="expanded[prefix]" class="ms-4">
            <li v-for="sf in group" :key="sf.sourceForm">
              <input
                type="checkbox"
                v-model="selectedFormsText"
                :value="sf.sourceForm"
              />
              {{ sf.sourceForm }} 
            <span v-if="formsInGroup[sf.sourceForm]">
            <b>Exist in:</b>
            {{ formsInGroup[sf.sourceForm].join(', ') }}
            </span>
            </li>
          </ul>
        </li>
      </ul>

      <div class="row mb-2">
        <div class="col-sm-5">
          <button
            class="btn btn-outline-primary mt-3"
            @click="confirmSelection"
          >
            Select
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      groupName: "",
      showTree: true,
      sourceForms: [],
      groupedForms: {},
      expanded: {},
      selectedFormsText: [],
      selectedForms: [],
      formsInGroup: {}
    };
  },
  async mounted() {
    this.id = this.$route.params.id;
    if (this.id == "new") {
      this.getSourceForm();
      this.getSourceFormInGroup()
      this.if = "";
      this.title = "Create new source form group";
    } else {
      this.getSourceForm().then(() => {
        this.$nextTick(() => this.getSourceFormGroup(this.id));
      });
      this.getSourceFormInGroup(this.id)
      this.title = "Edit source form group";
    }
  },
  methods: {
    async getSourceForm() {
      const url = "/api/web/sourceform";
      const res = await fetch(url, {
        headers: {
          Authorization: "Bearer " + this.$store.getters.serverAccessToken,
        },
      });
      const data = await res.json();
      const list = Array.isArray(data) ? data : data.data || [];
      this.sourceForms = list;

      this.groupedForms = list.reduce((acc, sf) => {
        const match = sf.sourceForm.match(/^[A-Z]+/);
        const prefix = match ? match[0] : "UNKNOWN";
        if (!acc[prefix]) acc[prefix] = [];
        acc[prefix].push({
          ...sf,
          inGroup: sf.inGroup || null,
        });
        return acc;
      }, {});
    },
    async getSourceFormGroup(name) {
      const url = "/api/web/sourceformgroup/" + name;
      const res = await fetch(url, {
        headers: {
          Authorization: "Bearer " + this.$store.getters.serverAccessToken,
        },
      });
      const data = await res.json();

      const list = Array.isArray(data) ? data : data.data || [];

      if (list.length === 0) return;

      this.groupName = list[0].groupCode;

      this.selectedFormsText = list.map((x) => x.sourceForm);

      this.selectedForms = this.sourceForms.filter((sf) =>
        this.selectedFormsText.includes(sf.sourceForm)
      );

      for (const prefix in this.groupedForms) {
        this.groupedForms[prefix].forEach((sf) => {
          sf.inGroup = this.selectedFormsText.includes(sf.sourceForm)
            ? this.groupName
            : sf.inGroup || null;
        });
      }
    },

    toggle(prefix) {
      this.expanded[prefix] = !this.expanded[prefix];
    },
    toggleGroup(prefix) {
      const group = this.groupedForms[prefix];
      const allSelected = group.every((sf) =>
        this.selectedFormsText.includes(sf.sourceForm)
      );
      if (allSelected) {
        this.selectedFormsText = this.selectedFormsText.filter(
          (sf) => !group.some((g) => g.sourceForm === sf)
        );
      } else {
        group.forEach((sf) => {
          if (!this.selectedFormsText.includes(sf.sourceForm)) {
            this.selectedFormsText.push(sf.sourceForm);
          }
        });
      }
    },
    isGroupSelected(prefix) {
      const group = this.groupedForms[prefix];
      return (
        group.length > 0 &&
        group.every((sf) => this.selectedFormsText.includes(sf.sourceForm))
      );
    },
    countSelected(prefix) {
      const group = this.groupedForms[prefix];
      return group.filter((sf) =>
        this.selectedFormsText.includes(sf.sourceForm)
      ).length;
    },
    confirmSelection() {
      this.selectedForms = this.sourceForms.filter((sf) =>
        this.selectedFormsText.includes(sf.sourceForm)
      );
      this.showTree = false;
    },
    goBack() {
      this.$router.back();
    },
    removeForm(index) {
      const removed = this.selectedForms.splice(index, 1)[0];
      this.selectedFormsText = this.selectedFormsText.filter(
        (sf) => sf !== removed.sourceForm
      );
    },
     async getSourceFormInGroup(name) {
      const url = "/api/web/sourceform/ingroups/" + name;
      const res = await fetch(url, {
        headers: {
          Authorization: "Bearer " + this.$store.getters.serverAccessToken,
        },
      });
      this.formsInGroup = await res.json();

    },
    async saveGroup() {
      if (!this.groupName.trim()) {
        alert("Please enter a group name!");
        return;
      }

      if (this.selectedForms.length === 0) {
        alert("Please select at least one SourceForm!");
        return;
      }
      if (this.id !== "new") {
        const deleteUrl = "/api/web/sourceformgroup/" + this.id;

        try {
          const delRes = await fetch(deleteUrl, {
            method: "DELETE",
            headers: {
              Authorization: "Bearer " + this.$store.getters.serverAccessToken,
            },
          });

          if (!delRes.ok) {
            const errText = await delRes.text();
            console.error("Delete failed:", errText);
            alert("Error deleting old group!");
            return;
          }
          console.log("Old group deleted successfully");
        } catch (e) {
          console.error("Delete request failed:", e);
          alert("Failed to delete the existing group.");
          return;
        }
      }
      const payload = {
        groupCode: this.groupName,
        sourceForm: this.selectedForms.map((sf) => sf.sourceForm),
      };

      const res = await fetch("/api/web/sourceformgroup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + this.$store.getters.serverAccessToken,
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      console.log(result);
      alert("Group saved successfully!");
    },
  },
};
</script>

<style scoped>
.tree-container ul {
  list-style: none;
  padding-left: 1em;
}
.tree-container li {
  margin-bottom: 4px;
}
button.btn-sm {
  padding: 2px 6px;
}

.outer-grid {
  display: grid !important;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px 24px;
  padding-left: 0;
}

.outer-grid > li {
  list-style: none;
}

.selected-list .item-row {
  display: grid;
  grid-template-columns: 150px auto;
  align-items: center;
  list-style: none;
  padding: 4px 0;
}

.item-text {
  white-space: nowrap;
}

.delete-btn {
  justify-self: start;
}
</style>
