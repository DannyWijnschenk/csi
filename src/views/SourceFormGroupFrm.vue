<template>
  <div class="group-editor">
    <div class="card p-4 mt-2">
      <h3>Group</h3>
      <input
        v-model="groupName"
        type="text"
        class="form-control mb-3"
        placeholder="Enter group name"
        style="max-width: 300px"
      />
      <div class="row mb-2">
        <div class="col-sm-5">
          <button
            type="button"
            class="btn btn-outline-primary"
            @click="saveGroup"
          >
            Save Group
          </button>
          &nbsp;
          <button
            type="button"
            class="btn btn-outline-danger"
            @click="deleteGroup"
          >
            Delete
          </button>
          &nbsp;
          <button
            type="button"
            class="btn btn-outline-secondary"
            @click="goBack"
          >
            Back
          </button>
          &nbsp;
        </div>
      </div>
    </div>

    <div v-if="showTree" class="tree-container card mt-2 p-3">
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
              <span
                v-if="
                  Object.keys(formsInGroup).some((k) => k.startsWith(prefix))
                "
                >*</span
              >
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
                {{ formsInGroup[sf.sourceForm].join(", ") }}
              </span>
            </li>
          </ul>
        </li>
      </ul>

      <div class="row mb-2">
        <div class="col-sm-5">
          <button
            type="button"
            class="btn btn-outline-primary"
            @click="saveGroup"
          >
            Save Group
          </button>
          &nbsp;
          <button
            type="button"
            class="btn btn-outline-danger"
            @click="deleteGroup"
          >
            Delete
          </button>
          &nbsp;
          <button
            type="button"
            class="btn btn-outline-secondary"
            @click="goBack"
          >
            Back
          </button>
          &nbsp;
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      id: null,
      groupName: "",
      showTree: true,
      sourceForms: [],
      groupedForms: {},
      expanded: {},
      selectedFormsText: [],
      formsInGroup: {},
    };
  },

  async mounted() {
    this.id = this.$route.params.id;

    if (this.id === "new") {
      await this.getSourceForm();
      await this.getSourceFormInGroup();
    } else {
      await this.getSourceForm();
      await this.getSourceFormGroup(this.id);
      await this.getSourceFormInGroup(this.id);
    }
  },

  computed: {
    selectedForms() {
      return this.sourceForms.filter(sf =>
        this.selectedFormsText.includes(sf.sourceForm)
      );
    }
},

  methods: {
    async getSourceForm() {
      const url = "/api/d2/sourceform";
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
        acc[prefix].push(sf);
        return acc;
      }, {});
    },

    async getSourceFormGroup(name) {
      const res = await fetch("/api/d2/sourceformgroup/" + name, {
        headers: {
          Authorization: "Bearer " + this.$store.getters.serverAccessToken,
        },
      });
      const data = await res.json();
      const list = Array.isArray(data) ? data : data.data || [];
      if (list.length === 0) return;

      this.groupName = list[0].groupCode;
      this.selectedFormsText = list.map((x) => x.sourceForm);
    },

    async getSourceFormInGroup(name) {
      const res = await fetch("/api/d2/sourceform/ingroups/" + name, {
        headers: {
          Authorization: "Bearer " + this.$store.getters.serverAccessToken,
        },
      });
      this.formsInGroup = await res.json();
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
      return this.groupedForms[prefix].filter((sf) =>
        this.selectedFormsText.includes(sf.sourceForm)
      ).length;
    },

  removeForm(index) {
    const removed = this.selectedForms[index];
    this.selectedFormsText = this.selectedFormsText.filter(
      sf => sf !== removed.sourceForm
    );
  },


    goBack() {
      this.$router.back();
    },

    async deleteGroup() {
      const delRes = await fetch("/api/d2/sourceformgroup/" + this.id, {
        method: "DELETE",
        headers: {
          Authorization: "Bearer " + this.$store.getters.serverAccessToken,
        },
      });

      if (!delRes.ok) {
        this.$toast.error("Not deleted");
        return;
      } else {
        this.goBack();
      }
    },

    async saveGroup() {
      await this.$nextTick();
      if (!this.groupName.trim()) {
        alert("Please enter a group name!");
        return;
      }

      if (this.selectedForms.length === 0) {
        alert("Please select at least one SourceForm!");
        return;
      }

      if (this.id !== "new") {
        const delRes = await fetch("/api/d2/sourceformgroup/" + this.id, {
          method: "DELETE",
          headers: {
            Authorization: "Bearer " + this.$store.getters.serverAccessToken,
          },
        });

        if (!delRes.ok) {
          this.$toast.error("Not Saved");
          return;
        }
      }

      const payload = {
        groupCode: this.groupName,
        sourceForm: this.selectedFormsText,
      };

      await fetch("/api/d2/sourceformgroup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + this.$store.getters.serverAccessToken,
        },
        body: JSON.stringify(payload),
      });

      this.$toast.success("Saved");
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
  grid-template-columns: repeat(4, 1fr);
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
