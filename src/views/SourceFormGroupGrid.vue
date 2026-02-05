<template>
  <div v-show="showLogin">
    <login-dialog ref="login" title="Login Server" v-on:loggedin="loggedin"></login-dialog>
  </div>
  <br />
  <div class="ps-2 pe-2">
    <!-- padding start and padding end of 2 pixels -->
    <div class="container-fluid card ps-2" v-if="this.$store.getters.isLoggedIn">
      <!-- inner padding of 2 pixels -->
      <div class="card-header" v-if="this.$store.getters.isLoggedIn">
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <div v-if="title" class="">
              <b>{{ title }}</b>
            </div>
            <div v-if="error" class="alert alert-danger">
              <b>{{ error }}</b>
            </div>
          </div>
          <button type="button" class="btn btn-outline-secondary" @click="exportExcel">
            Export to Excel
          </button>
        </div>
      </div>
      <div class="card-body">
        <div class="row">
          <grid-data
            ref="grid"
            titleHeading="SourceFormGroup"
            table="SourceFormGroup"
            v-on:gridClickRow="gridclickrow"
          ></grid-data>
        </div>
      </div>
    </div>
  </div>
  <!--card -->
</template>

<script>
import LoginDialog from "@/components/LoginDialog.vue";
import GridData from "@/components/GridData.vue";
import * as XLSX from "xlsx";

export default {
  components: {
    LoginDialog,
    GridData,
  },
  data() {
    return {
      title: "SourceFormGroup Settings",
      error: "",
      status: "",
      filter: {},

      sourceForms: [],
      groupedForms: {},
    };
  },
  computed: {
    showLogin() {
      return !this.$store.getters.isLoggedIn;
    },
  },
  methods: {
    loggedin() {},

    gridclickrow(button, name) {
      if (button === "edit") {
        this.editParameter(name);
      } else if (button === "add") {
        this.addParameter();
      }
    },

    addParameter() {
      this.$router.push("/sourceformgroup/new");
    },

    editParameter(name) {
      this.$router.push("/sourceformgroup/" + name);
    },

    getParameters(refresh = false) {
      this.$refs.grid.getData(JSON.stringify(this.filter), null, refresh);
    },

    async getSourceForm() {
      const url = this.$store.getters.serverUrl + "/d2/sourceform";
      const res = await fetch(url, {
        headers: {
          Authorization: "Bearer " + this.$store.getters.serverAccessToken,
        },
      });

      const data = await res.json();
      const list = Array.isArray(data) ? data : data.data || [];

      this.sourceForms = list;
      this.groupedForms = list.reduce((acc, sf) => {
        const match = (sf.sourceForm || "").match(/^[A-Z]+/);
        const prefix = match ? match[0] : "UNKNOWN";
        if (!acc[prefix]) acc[prefix] = [];
        acc[prefix].push(sf);
        return acc;
      }, {});
    },

    async exportExcel() {
      try {
        this.error = "";

        if (!this.groupedForms || Object.keys(this.groupedForms).length === 0) {
          await this.getSourceForm();
        }

        const groupsUrl = this.$store.getters.serverUrl + "/d2/sourceformgroup";
        const groupsRes = await fetch(groupsUrl, {
          headers: { Authorization: "Bearer " + this.$store.getters.serverAccessToken },
        });

        if (!groupsRes.ok) {
          throw new Error(`Error fetching groups: ${groupsRes.status} ${groupsRes.statusText}`);
        }

        const groupsData = await groupsRes.json();
        const groupsList = Array.isArray(groupsData) ? groupsData : groupsData.data || [];

        if (groupsList.length === 0) {
          this.$toast?.info("No groups found to export");
          return;
        }

        const groupedByCode = {};
        groupsList.forEach((item) => {
          if (!item.groupCode) return;
          if (!groupedByCode[item.groupCode]) groupedByCode[item.groupCode] = [];
          if (item.sourceForm) groupedByCode[item.groupCode].push(item.sourceForm);
        });

        const excelData = [["SourceFormGroupName", "SourceFromBlock", "SourceForm", "TotalSize", "TotalCount"]];

        let currentRow = 1;
        const merges = [];
        const borderBlocks = [];

        const groupEntries = Object.entries(groupedByCode);

        for (const [groupCode, sourceForms] of groupEntries) {
          try {
            const sizeCountRes = await fetch(this.$store.getters.serverUrl + "/d2/sourceform/sizecount", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + this.$store.getters.serverAccessToken,
              },
              body: JSON.stringify({ sourceForms }),
            });

            const totalSizeCount = sizeCountRes.ok
              ? await sizeCountRes.json()
              : { totalCount: 0, totalSize: 0 };

            const grouped = (sourceForms || []).reduce((acc, form) => {
              const match = (form || "").match(/^[A-Z]+/);
              const prefix = match ? match[0] : "UNKNOWN";
              if (!acc[prefix]) acc[prefix] = [];
              acc[prefix].push(form);
              return acc;
            }, {});

            const groupStartRow = currentRow;

            Object.keys(grouped).forEach((prefix) => {
              const forms = grouped[prefix] || [];
              const prefixStartRow = currentRow;

              forms.forEach((form) => {
                excelData.push(["", "", form, "", ""]);
                currentRow++;
              });

              const prefixEndRow = currentRow - 1;

              merges.push({ s: { r: prefixStartRow, c: 1 }, e: { r: prefixEndRow, c: 1 } });

              borderBlocks.push({ start: prefixStartRow, end: prefixEndRow });

              excelData[prefixStartRow][1] = prefix;
            });

            const groupEndRow = currentRow - 1;

            merges.push({ s: { r: groupStartRow, c: 0 }, e: { r: groupEndRow, c: 0 } });
            excelData[groupStartRow][0] = groupCode;

            merges.push({ s: { r: groupStartRow, c: 3 }, e: { r: groupEndRow, c: 3 } });
            merges.push({ s: { r: groupStartRow, c: 4 }, e: { r: groupEndRow, c: 4 } });

            const totalSizeGb = (Number(totalSizeCount.totalSize) || 0) / 1024;
            const totalCountN = Number(totalSizeCount.totalCount) || 0;

            excelData[groupStartRow][3] = Number(totalSizeGb.toFixed(2));
            excelData[groupStartRow][4] = totalCountN;
          } catch (groupError) {
            console.error(`Error processing group ${groupCode}:`, groupError);
          }
        }

        const totalRow = currentRow;
        excelData.push(["TOTAL", "", "", "", ""]);

        const ws = XLSX.utils.aoa_to_sheet(excelData);
        const sizeFmt = '0.00" Gb"';
        const countFmt = "#,##0";

        for (let r = 1; r <= totalRow; r++) {
          const sizeCell = ws[XLSX.utils.encode_cell({ r, c: _ATTACH_COL(3) })];
          if (sizeCell) sizeCell.z = sizeFmt;

          const countCell = ws[XLSX.utils.encode_cell({ r, c: 4 })];
          if (countCell) countCell.z = countFmt;
        }

        ws["!merges"] = merges;
        ws["!cols"] = [
          { wch: 28 },
          { wch: 20 },
          { wch: 30 },
          { wch: 14 },
          { wch: 18 },
        ]

        const firstDataRow = 1;
        const lastGroupRow = totalRow - 1;
        if (lastGroupRow >= firstDataRow) {
          const cellD = XLSX.utils.encode_cell({ r: totalRow, c: 3 });
          ws[cellD] = ws[cellD] || {};
          ws[cellD].t = "n";
          ws[cellD].f = `SUM(D${firstDataRow + 1}:D${lastGroupRow + 1})`;
          ws[cellD].z = sizeFmt;

          const cellE = XLSX.utils.encode_cell({ r: totalRow, c: 4 });
          ws[cellE] = ws[cellE] || {};
          ws[cellE].t = "n";
          ws[cellE].f = `SUM(E${firstDataRow + 1}:E${lastGroupRow + 1})`;
          ws[cellE].z = countFmt;
        }

        const borderStyle = {
          top: { style: "thin", color: { rgb: "000000" } },
          bottom: { style: "thin", color: { rgb: "000000" } },
          left: { style: "thin", color: { rgb: "000000" } },
          right: { style: "thin", color: { rgb: "000000" } },
        };

        borderBlocks.forEach(({ start, end }) => {
          for (let r = start; r <= end; r++) {
            for (let c = 0; c <= 4; c++) {
              const cell = ws[XLSX.utils.encode_cell({ r, c })];
              if (!cell) continue;
              cell.s = cell.s || {};
              cell.s.border = borderStyle;
              cell.s.alignment = { vertical: "top" };
            }
          }
        });

        for (let r = 1; r < totalRow; r++) {
          const cell = ws[XLSX.utils.encode_cell({ r, c: 0 })];
          if (cell) {
            cell.s = cell.s || {};
            cell.s.alignment = { vertical: "top" };
          }
        }

        [0, 3, 4].forEach((c) => {
          const cell = ws[XLSX.utils.encode_cell({ r: totalRow, c })];
          if (cell) {
            cell.s = cell.s || {};
            cell.s.font = { bold: true };
          }
        });

        const sheet2Data = [["SourceFromBlock", "SourceForm", "Size", "Count", "BlockTotalSize", "BlockTotalCount"]];

        let r2 = 1;
        const merges2 = [];
        const borderBlocks2 = [];

        const entries2 = Object.entries(this.groupedForms || {}).sort(([a], [b]) => a.localeCompare(b));

        for (const [prefix, itemsRaw] of entries2) {
          const items = (itemsRaw || [])
            .slice()
            .sort((a, b) => (a.sourceForm || "").localeCompare(b.sourceForm || ""));

          if (items.length === 0) continue;

          const blockStartRow = r2;

          for (const sf of items) {
            const form = sf.sourceForm || "";
            const formSizeGb = (Number(sf.totalSize) || 0) / 1024;
            const formCountN = Number(sf.totalCount) || 0;

            sheet2Data.push(["", form, Number(formSizeGb.toFixed(2)), formCountN, "", ""]);
            r2++;
          }

          const blockEndRow = r2 - 1;

          sheet2Data[blockStartRow][0] = prefix;

          merges2.push({ s: { r: blockStartRow, c: 0 }, e: { r: blockEndRow, c: 0 } });
          merges2.push({ s: { r: blockStartRow, c: 4 }, e: { r: blockEndRow, c: 4 } });
          merges2.push({ s: { r: blockStartRow, c: 5 }, e: { r: blockEndRow, c: 5 } });

          borderBlocks2.push({ start: blockStartRow, end: blockEndRow });
        }

        const totalRowIndex2 = r2;
        sheet2Data.push(["TOTAL", "", "", "", "", ""]);
        merges2.push({ s: { r: totalRowIndex2, c: 1 }, e: { r: totalRowIndex2, c: 3 } });

        const ws2 = XLSX.utils.aoa_to_sheet(sheet2Data);

        for (let r = 1; r <= totalRowIndex2; r++) {
          const cSize = ws2[XLSX.utils.encode_cell({ r, c: 2 })];
          if (cSize) cSize.z = sizeFmt;

          const cCount = ws2[XLSX.utils.encode_cell({ r, c: 3 })];
          if (cCount) cCount.z = countFmt;

          const bSize = ws2[XLSX.utils.encode_cell({ r, c: 4 })];
          if (bSize) bSize.z = sizeFmt;

          const bCount = ws2[XLSX.utils.encode_cell({ r, c: 5 })];
          if (bCount) bCount.z = countFmt;
        }

        ws2["!merges"] = merges2;
        ws2["!cols"] = [
          { wch: 28 },
          { wch: 32 },
          { wch: 14 },
          { wch: 14 },
          { wch: 18 },
          { wch: 20 },
        ]


        for (const { start, end } of borderBlocks2) {
          const excelStart = start + 1;
          const excelEnd = end + 1;

          const eAddr = XLSX.utils.encode_cell({ r: start, c: 4 });
          ws2[eAddr] = ws2[eAddr] || {};
          ws2[eAddr].t = "n";
          ws2[eAddr].f = `SUM(C${excelStart}:C${excelEnd})`;
          ws2[eAddr].z = sizeFmt;

          const fAddr = XLSX.utils.encode_cell({ r: start, c: 5 });
          ws2[fAddr] = ws2[fAddr] || {};
          ws2[fAddr].t = "n";
          ws2[fAddr].f = `SUM(D${excelStart}:D${excelEnd})`;
          ws2[fAddr].z = countFmt;
        }

        const totalE = XLSX.utils.encode_cell({ r: totalRowIndex2, c: 4 });
        ws2[totalE] = ws2[totalE] || {};
        ws2[totalE].t = "n";
        ws2[totalE].f = `SUM(E2:E${totalRowIndex2})`;
        ws2[totalE].z = sizeFmt;

        const totalF = XLSX.utils.encode_cell({ r: totalRowIndex2, c: 5 });
        ws2[totalF] = ws2[totalF] || {};
        ws2[totalF].t = "n";
        ws2[totalF].f = `SUM(F2:F${totalRowIndex2})`;
        ws2[totalF].z = countFmt;

        const blocksPlusTotal = [...borderBlocks2, { start: totalRowIndex2, end: totalRowIndex2 }];
        blocksPlusTotal.forEach(({ start, end }) => {
          for (let r = start; r <= end; r++) {
            for (let c = 0; c <= 5; c++) {
              const cell = ws2[XLSX.utils.encode_cell({ r, c })];
              if (!cell) continue;
              cell.s = cell.s || {};
              cell.s.border = borderStyle;
              cell.s.alignment = { vertical: "top" };
            }
          }
        });

        for (let c = 0; c <= 5; c++) {
          const cell = ws2[XLSX.utils.encode_cell({ r: 0, c })];
          if (cell) {
            cell.s = cell.s || {};
            cell.s.font = { bold: true };
          }
        }

        [0, 4, 5].forEach((c) => {
          const cell = ws2[XLSX.utils.encode_cell({ r: totalRowIndex2, c })];
          if (cell) {
            cell.s = cell.s || {};
            cell.s.font = { bold: true };
          }
        });

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "SourceFormGroups");
        XLSX.utils.book_append_sheet(wb, ws2, "SourceFormsByBlock");

        XLSX.writeFile(wb, "sourceformgroups.xlsx");
        this.$toast?.success(`Excel file exported successfully with ${groupEntries.length} groups`);
      } catch (e) {
        console.error(e);
        this.error = "Error exporting to Excel: " + (e?.message || String(e));
        this.$toast?.error("Error exporting to Excel");
      }
    },
  },

  mounted() {
    this.getParameters();
    this.getSourceForm();
  },
};

function _ATTACH_COL(n) {
  return n;
}
</script>
