<template>
    <div v-show=showLogin> 
      <login-dialog ref="login" title="Login Server" v-on:loggedin="loggedin"></login-dialog>
    </div>
    <br>
    <div class="ps-2 pe-2">  <!-- padding start and padding end of 2 pixels -->
      <div class="container-fluid card ps-2" v-if='this.$store.getters.isLoggedIn'>  <!-- inner padding of 2 pixels -->
        <div class="card-header" v-if='this.$store.getters.isLoggedIn'>
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <div v-if="((title!='') && (title != null) && (title !== undefined))" class="">
                <b>{{title}}</b>
              </div>
              <div v-if="((error!='') && (error != null) && (error !== undefined))" class="alert alert-danger">
                <b>{{error}}</b>
              </div>
            </div>
            <button type="button" class="btn btn-outline-secondary" @click="exportExcel">
              Export to Excel
            </button>
          </div>
        </div>
        <div class="card-body">
          <div class="row">
            <grid-data ref="grid" titleHeading="SourceFormGroup" table="SourceFormGroup" v-on:gridClickRow="gridclickrow"></grid-data>
          </div>
        </div>
      </div>
    </div>  <!--card -->
</template>
  
<script>
  import LoginDialog from '@/components/LoginDialog.vue'
  import GridData from '@/components/GridData.vue'
  import * as XLSX from "xlsx"
  export default {
    components: {
      LoginDialog,
      GridData
    },
    data() {
      return {
        title : 'SourceFormGroup Settings',
        error : '',
        status : '',
        filter: {  },
      }
    },
    computed: {
      showLogin: function () {
        return !this.$store.getters.isLoggedIn;
      }
    },
    methods: {
      loggedin() {
        
      },
      gridclickrow(button, name) {
        if (button=='edit') {
          this.editParameter(name)
        } else if (button == 'add') {
          this.addParameter()
        }
      },
      addParameter() {
        this.$router.push('/sourceformgroup/new');
      },
    editParameter(name) {
        this.$router.push('/sourceformgroup/' + name);
      },
      getParameters(refresh = false) {
        this.$refs.grid.getData(JSON.stringify(this.filter),null,refresh);
      },
      async exportExcel() {
        try {
          this.error = ''
          
          const groupsUrl = this.$store.getters.serverUrl + "/d2/sourceformgroup"
          const groupsRes = await fetch(groupsUrl, {
            headers: {
              Authorization: "Bearer " + this.$store.getters.serverAccessToken,
            },
          })
          
          if (!groupsRes.ok) {
            throw new Error(`Error fetching groups: ${groupsRes.status} ${groupsRes.statusText}`)
          }
          
          const groupsData = await groupsRes.json()
          const groupsList = Array.isArray(groupsData) ? groupsData : groupsData.data || []
          
          if (groupsList.length === 0) {
            this.$toast?.info("No groups found to export")
            return
          }
          
          const groupedByCode = {}
          groupsList.forEach(item => {
            if (!item.groupCode) return 
            if (!groupedByCode[item.groupCode]) {
              groupedByCode[item.groupCode] = []
            }
            if (item.sourceForm) {
              groupedByCode[item.groupCode].push(item.sourceForm)
            }
          })
          
          console.log('Grouped by code:', Object.keys(groupedByCode).length, 'groups')
          console.log('Group codes:', Object.keys(groupedByCode))
          
          const excelData = [
            ["SourceFormGroupName", "SourceFromBlock", "SourceForm", "TotalSize", "TotalCount"],
          ]
          
          let currentRow = 1
          const merges = []
          const borderBlocks = []
          let totalSizeSum = 0
          let totalCountSum = 0
          
          const groupEntries = Object.entries(groupedByCode)
          console.log('Processing', groupEntries.length, 'groups')
          
          for (const [groupCode, sourceForms] of groupEntries) {
            try {
              console.log('Processing group:', groupCode, 'with', sourceForms.length, 'forms')
              
              const sizeCountRes = await fetch(this.$store.getters.serverUrl + "/d2/sourceform/sizecount", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: "Bearer " + this.$store.getters.serverAccessToken,
                },
                body: JSON.stringify({ sourceForms }),
              })
              
              const totalSizeCount = sizeCountRes.ok ? await sizeCountRes.json() : { totalCount: 0, totalSize: 0 }
              
              totalSizeSum += totalSizeCount.totalSize || 0
              totalCountSum += totalSizeCount.totalCount || 0
              
              const grouped = sourceForms.reduce((acc, form) => {
                const match = form.match(/^[A-Z]+/)
                const prefix = match ? match[0] : "UNKNOWN"
                if (!acc[prefix]) acc[prefix] = []
                acc[prefix].push(form)
                return acc
              }, {})
              
              const groupStartRow = currentRow
              
              Object.keys(grouped).forEach((prefix) => {
                const forms = grouped[prefix]
                const prefixStartRow = currentRow
                
                forms.forEach((form) => {
                  excelData.push(["", "", form, "", ""])
                  currentRow++
                })
                
                const prefixEndRow = currentRow - 1
                
                merges.push({
                  s: { r: prefixStartRow, c: 1 },
                  e: { r: prefixEndRow, c: 1 }
                })
                
                borderBlocks.push({ start: prefixStartRow, end: prefixEndRow })
                
                excelData[prefixStartRow][1] = prefix
              })
              
              const groupEndRow = currentRow - 1
              
              merges.push({
                s: { r: groupStartRow, c: 0 },
                e: { r: groupEndRow, c: 0 }
              })
              
              excelData[groupStartRow][0] = groupCode
              
              merges.push({
                s: { r: groupStartRow, c: 3 },
                e: { r: groupEndRow, c: 3 }
              })
              
              merges.push({
                s: { r: groupStartRow, c: 4 },
                e: { r: groupEndRow, c: 4 }
              })
              
              const totalSize = Number((totalSizeCount.totalSize / 1024).toFixed(2)) + " Gb"
              const totalCount = totalSizeCount.totalCount?.toLocaleString("uk-UA")
              
              excelData[groupStartRow][3] = totalSize
              excelData[groupStartRow][4] = totalCount
              
            } catch (groupError) {
              console.error(`Error processing group ${groupCode}:`, groupError)
            }
          }
          
          const totalRow = currentRow
          excelData.push(["TOTAL", "", "", "", ""])
          excelData[totalRow][3] = Number((totalSizeSum / 1024).toFixed(2)) + " Gb"
          excelData[totalRow][4] = totalCountSum.toLocaleString("uk-UA")
          
          const ws = XLSX.utils.aoa_to_sheet(excelData)
          ws["!merges"] = merges
          
          borderBlocks.forEach(({ start, end }) => {
            for (let r = start; r <= end; r++) {
              for (let c = 0; c <= 4; c++) {
                let cell = ws[XLSX.utils.encode_cell({ r, c })]
                if (!cell) continue
                if (!cell.s) cell.s = {}
                
                const borderStyle = {
                  top: { style: "thin", color: { rgb: "000000" } },
                  bottom: { style: "thin", color: { rgb: "000000" } },
                  left: { style: "thin", color: { rgb: "000000" } },
                  right: { style: "thin", color: { rgb: "000000" } },
                }
                
                cell.s.border = borderStyle
                cell.s.alignment = { vertical: "top" }
              }
            }
          })
          
          for (let r = 1; r < totalRow; r++) {
            const cell = ws[XLSX.utils.encode_cell({ r, c: 0 })]
            if (cell) {
              cell.s = cell.s || {}
              cell.s.alignment = { vertical: "top" }
            }
          }
          
          const totalRowCells = [0, 3, 4].map(c => ws[XLSX.utils.encode_cell({ r: totalRow, c: c })])
          totalRowCells.forEach(cell => {
            if (cell) {
              cell.s = cell.s || {}
              cell.s.font = { bold: true }
            }
          })
          
          const wb = XLSX.utils.book_new()
          XLSX.utils.book_append_sheet(wb, ws, "SourceFormGroups")
          
          console.log('Total rows:', excelData.length - 1, 'groups processed')
          
          XLSX.writeFile(wb, "sourceformgroups.xlsx")
          this.$toast?.success(`Excel file exported successfully with ${groupEntries.length} groups`)
        } catch (e) {
          console.error(e)
          this.error = 'Error exporting to Excel: ' + e.message
          this.$toast?.error("Error exporting to Excel")
        }
      },
    },
  mounted() {
    this.getParameters();
    }
  }
  </script>