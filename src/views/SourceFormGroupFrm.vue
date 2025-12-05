<template>
  <div class="group-editor">
    <div class="card p-4 mt-2">
      <h3>SourceFormGroup</h3>
      <div class="d-flex align-items-center justify-content-between mb-3 w-100">
        <input
          v-model="groupName"
          type="text"
          class="form-control"
          placeholder="Enter group name"
          style="max-width: 300px"
        />

        <div class="ms-3 text-end" style="white-space: nowrap">
          <div>
            Total count: <strong>{{ totalSizeCount.totalCount?.toLocaleString('uk-UA') }}</strong>
          </div>
          <div>
            Total size: <strong>{{ Number((this.totalSizeCount.totalSize / 1024).toFixed(2))}} Gb</strong>
          </div>
        </div>
      </div>

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
      <div class="d-flex align-items-center justify-content-between mb-3 w-100">
        <h4 class="mb-0">Select SourceForms</h4>

        <div class="d-flex gap-3">
          <label class="d-flex align-items-center mb-0">
            <input
              type="checkbox"
              class="me-2"
              value="usedInGroup"
              @change="checkboxChanged"
            />
            Not used in other groups
          </label>

          <label class="d-flex align-items-center mb-0 text-nowrap">
            <input
              type="date"
              class="form-control form-control-sm me-2"
              v-model="usedSince"
            />
            Used since
          </label>
        </div>
      </div>

      <ul class="ms-4 outer-grid">
        <li v-for="(group, prefix) in filteredGroupedForms" :key="prefix">
          <div
           class="d-flex align-items-center"
           :class="{ 'bg-highlight': Object.keys(formsInGroup).some(k => k.startsWith(prefix)) }"
           >
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
              ({{ countSelected(prefix) }}/{{ filterByDate(group).length }})
            </span>
          </div>

          <ul v-show="expanded[prefix]" class="ms-4">
            <li v-for="sf in filterByDate(group)" :key="sf.sourceForm">
              <input
                type="checkbox"
                v-model="selectedFormsText"
                :value="sf.sourceForm"
                @change="getSourceFormCount"
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
          <button
          type="button"
          class="btn btn-outline-secondary"
          @click="exportExcel"
        >
          Export to Exel
        </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as XLSX from "xlsx";

export default {
  data() {
    return {
      id: null,
      groupName: "",
      usedSince: null,
      showTree: true,
      sourceForms: [],
      groupedForms: {},
      expanded: {},
      selectedFormsText: [],
      formsInGroup: {},
      totalSizeCount: { totalCount: 0, totalSize: 0 },
      checkboxControl: { usedInGroup: false, usedSince: false },
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
      await this.getSourceFormCount();
    }
  },

  computed: {
    selectedForms() {
      return this.sourceForms.filter((sf) =>
        this.selectedFormsText.includes(sf.sourceForm)
      );
    },
    filteredGroupedForms() {
      return Object.fromEntries(
        Object.entries(this.groupedForms).filter(([prefix, group]) => {
          const existsInGroup = Object.keys(this.formsInGroup).some((k) =>
            k.startsWith(prefix)
          );

          if (existsInGroup && this.checkboxControl.usedInGroup) {
            return false;
          }

          return this.filterByDate(group).length > 0;
        })
      );
    },
  },

  methods: {
    filterByDate(list) {
      if (!list) return [];

      if (!this.usedSince) return list;

      const sinceDate = new Date(this.usedSince + "T00:00:00");

      return list.filter(sf => {
        const lastUsedDate = new Date(sf.lastUsed);
        return lastUsedDate >= sinceDate;
      });
    },
    exportExcel() {
      const payload = {
        groupCode: this.groupName,
        sourceForm: this.selectedFormsText,
      };

      const grouped = payload.sourceForm.reduce((acc, form) => {
        const match = form.match(/^[A-Z]+/);
        const prefix = match ? match[0] : "UNKNOWN";

        if (!acc[prefix]) acc[prefix] = [];
        acc[prefix].push(form);

        return acc;
      }, {});

      const excelData = [
        ["SourceFormGroupName", "SourceFromBlock", "SourceForm"],
      ];

      let startRow = 1;
      const merges = [];
      const borderBlocks = [];

      Object.keys(grouped).forEach((prefix) => {
        const forms = grouped[prefix];
        const groupStart = startRow;

        forms.forEach((form) => {
          excelData.push(["", "", form]);
          startRow++;
        });

        const groupEnd = startRow - 1;

        merges.push({
          s: { r: groupStart, c: 1 },
          e: { r: groupEnd, c: 1 }
        });

        borderBlocks.push({ start: groupStart, end: groupEnd });

        excelData[groupStart][1] = prefix;
      });

      const lastRow = startRow - 1;

      merges.push({
        s: { r: 1, c: 0 },
        e: { r: lastRow, c: 0 }
      });

      excelData[1][0] = payload.groupCode;

      const ws = XLSX.utils.aoa_to_sheet(excelData);
      ws["!merges"] = merges;

      const groupCodeCell = ws["A2"];
      if (groupCodeCell) {
        groupCodeCell.s = groupCodeCell.s || {};
        groupCodeCell.s.alignment = { vertical: "top" };
      }

      borderBlocks.forEach(({ start, end }) => {
        for (let r = start; r <= end; r++) {
          let cellA = ws[XLSX.utils.encode_cell({ r, c: 0 })];
          let cellB = ws[XLSX.utils.encode_cell({ r, c: 1 })];

          if (!cellA.s) cellA.s = {};
          if (!cellB.s) cellB.s = {};

          const borderStyle = {
            top: { style: "thin", color: { rgb: "000000" }},
            bottom: { style: "thin", color: { rgb: "000000" }},
            left: { style: "thin", color: { rgb: "000000" }},
            right: { style: "thin", color: { rgb: "000000" }},
          };

          cellA.s.border = borderStyle;
          cellB.s.border = borderStyle;

          cellA.s.alignment = { vertical: "top" };
          cellB.s.alignment = { vertical: "top" };
        }
      });

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Forms");

      XLSX.writeFile(wb, "forms.xlsx");
    },
    checkboxChanged(event) {
      const isChecked = event.target.checked;
      const checkType = event.target.value;

      if (isChecked) {
        this.checkboxControl[checkType] = true;
      } else {
        this.checkboxControl[checkType] = false;
      }

      console.log("Selected:", this.checkboxControl);
    },
    async getSourceForm() {
      const url = this.$store.getters.serverUrl+"/d2/sourceform";
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
      console.log(this.groupedForms)
    },

    async getSourceFormGroup(name) {
      const res = await fetch(this.$store.getters.serverUrl+"/d2/sourceformgroup/" + name, {
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
      const res = await fetch(this.$store.getters.serverUrl+"/d2/sourceform/ingroups/" + name, {
        headers: {
          Authorization: "Bearer " + this.$store.getters.serverAccessToken,
        },
      });
      this.formsInGroup = await res.json();
    },

    toggle(prefix) {
      this.expanded[prefix] = !this.expanded[prefix];
    },

    async toggleGroup(prefix) {
      const group = this.filterByDate(this.groupedForms[prefix]);
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
      await this.getSourceFormCount();
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
        (sf) => sf !== removed.sourceForm
      );
    },

    goBack() {
      this.$router.back();
    },

    async deleteGroup() {
      const ok = await this.$confirm({
        title: "Delete group",
        body: "Do you want delete this group?",
        confirmText: "Yes",
        cancelText: "No",
      });

      if (ok) {
        const delRes = await fetch(this.$store.getters.serverUrl+"/d2/sourceformgroup/" + this.id, {
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
      }
    },
    async getSourceFormCount() {
      await this.$nextTick();

      const payload = {
        sourceForms: this.selectedFormsText,
      };

      const res = await fetch(this.$store.getters.serverUrl+"/d2/sourceform/sizecount", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + this.$store.getters.serverAccessToken,
        },
        body: JSON.stringify(payload),
      });
      this.totalSizeCount = await res.json();
      console.log(this.totalSizeCount);
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
        const delRes = await fetch(this.$store.getters.serverUrl+"/d2/sourceformgroup/" + this.id, {
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

      console.log(payload)

      await fetch(this.$store.getters.serverUrl+"/d2/sourceformgroup", {
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

.bg-highlight {
  background-color: #fff3cd;
}
</style>
