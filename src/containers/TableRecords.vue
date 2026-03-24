<template lang="pug">
  el-col(:span="24")
    RecordListFilter(
      :getKeys="getKeys"
      :filterRecords="filterRecords"
      :filterAdvancedRecords="filterAdvancedRecords"
      :setFilterColumn="setFilterColumn"
      :setFilterValueType="setFilterValueType"
      :setNotEqualExpr="setNotEqualExpr"
      :filtered="records.filtered"
      :useAdvancedFilter="records.useAdvancedFilter"
      :refreshTable="refreshTable"
      :filterParams="records.filterParams"
      :advancedFilter="records.advancedFilter"
      :headerType="records.headerType"
      :addCondition="addFilterCondition"
      :removeCondition="removeFilterCondition"
      :resetAdvancedFilter="resetAdvancedFilter"
    )
    RecordList(
      :list="tableDataPage"
      :keys="keys"
      :showEditModal="showEditModal"
      :header="records.header"
      :hideHashKey="hideHashKey"
      :showDeleteModal="showDeleteModal"
      :showGroupDeleteModal="toggleGroupDeleteModal"
      :handleRowSelection="selectRows"
      :selectedItems="records.selectedRows.length"
      :indexOffset="records.bufferPageIndex * (records.limit || 500)"
      size="mini"
    )
    RecordFooter(
      :generateMeta="generateMeta"
      :refreshTable="refreshTable"
      :currentTable="currentTable"
      :itemCount="itemCount"
      :getLimitedRows="getLimitedRows"
      :records="records"
      :getPreviousRecords="getPreviousRecords"
      :getNextRecords="getNextRecords"
      :cancelScan="cancelScan"
      :bufferPageNext="bufferPageNext"
      :bufferPagePrev="bufferPagePrev"
      :setPaginationMode="setPaginationMode"
      :list="tableDataPage"
    )
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import { Getter, Action, Mutation, State } from 'vuex-class';
import { RecordModuleState } from '../store/modules/records/types';
import RecordList from '../components/RecordList.vue';
import RecordListFilter from '../components/RecordListFilter.vue';
import RecordFooter from '../components/RecordFooter.vue';

const namespace: string = 'records';

@Component({
  components: {
    RecordList,
    RecordListFilter,
    RecordFooter,
  },
})
export default class TableRecords extends Vue {
  @Getter private currentTable: any;
  @State(namespace) private records!: RecordModuleState;
  @Getter('itemCount', { namespace }) private itemCount!: number;
  @Getter('keys', { namespace }) private keys!: {
    hashKey: string;
    rangeKey: string;
  };
  @Getter('getKeys', { namespace }) private getKeys!: Array<{ value: string }>;
  @Getter('tableDataPage', { namespace }) private tableDataPage!: any[];
  @Getter('hideHashKey', { namespace }) private hideHashKey!: boolean;
  @Action('generateMeta', { namespace }) private generateMeta: any;
  @Action('filterRecords', { namespace }) private filterRecords: any;
  @Action('getItem', { namespace }) private getItem: any;
  @Action('removeSelected', { namespace }) private removeSelected: any;
  @Action('getLimitedRows', { namespace }) private getLimitedRows: any;
  @Action('getPreviousRecords', { namespace }) private getPreviousRecords: any;
  @Action('getNextRecords', { namespace }) private getNextRecords: any;
  @Action('refreshTable', { namespace }) private refreshTable: any;
  @Action('filterAdvancedRecords', { namespace }) private filterAdvancedRecords: any;
  @Mutation('toggleDeleteModal', { namespace }) private toggleDeleteModal: any;
  @Mutation('toggleCreateModal', { namespace }) private toggleCreateModal: any;
  @Mutation('toggleGroupDeleteModal', { namespace })
  private toggleGroupDeleteModal: any;
  @Mutation('setFilterColumn', { namespace })
  private setFilterColumn: any;
  @Mutation('setFilterValueType', { namespace })
  private setFilterValueType: any;
  @Mutation('setNotEqualExpr', { namespace }) private setNotEqualExpr: any;
  @Mutation('addFilterCondition', { namespace }) private addFilterCondition: any;
  @Mutation('removeFilterCondition', { namespace }) private removeFilterCondition: any;
  @Mutation('resetAdvancedFilter', { namespace }) private resetAdvancedFilter: any;
  @Mutation('cancelScan', { namespace }) private cancelScan: any;
  @Mutation('bufferPageNext', { namespace }) private bufferPageNext: any;
  @Mutation('bufferPagePrev', { namespace }) private bufferPagePrev: any;
  @Mutation('setPaginationMode', { namespace }) private setPaginationMode: any;
  @Mutation('selectRows', { namespace }) private selectRows: any;

  private showDeleteModal(row: any) {
    this.getItem(row);
    this.toggleDeleteModal();
  }
  private showEditModal(row: any) {
    this.getItem(row);
    this.toggleCreateModal();
  }
}
</script>

<style lang="stylus" scoped>
</style>
