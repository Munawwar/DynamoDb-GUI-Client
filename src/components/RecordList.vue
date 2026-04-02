<template lang="pug">
  el-row(class="table")
    el-table(
      :data="list"
      border
      v-if="keys.hashKey"
      size="mini"
      @row-dblclick="showEditModal"
      tooltip-effect="light"
      @selection-change="handleRowSelection"
      :height="'100%'"
      )
      el-table-column(type="selection" width="50")
      el-table-column(type="index" :index="indexMethod")
      el-table-column(:prop="keys.hashKey" :show-overflow-tooltip="true" :sort-method="(a, b) => compareByProp(a, b, keys.hashKey)" sortable=true)
        template(slot="header" slot-scope="slot" )
          span {{keys.hashKey}}
          i(class="el-icon-warning key")
      el-table-column(:prop="keys.rangeKey" :show-overflow-tooltip="true" :sort-method="(a, b) => compareByProp(a, b, keys.rangeKey)" v-if="keys.rangeKey" sortable=true)
        template(slot="header" slot-scope="slot")
          span {{keys.rangeKey}}
          i(class="el-icon-warning key")
      el-table-column(
        v-for="(header, index) of header"
        :show-overflow-tooltip="true"
        :prop="header"
        :sort-method="(a, b) => compareByProp(a, b, header)"
        :label="header"
        :key="header"
        v-if="hideHashKey(header)"
        sortable=true
      )
      el-table-column(fixed="right" width="50")
        template(slot="header" slot-scope="slot")
          .delete-selected
            i(class="el-icon-delete" v-if="selectedItems" @click="showGroupDeleteModal" title="Delete Selected")
        template(slot-scope="scope")
          span(class="delete-column")
            i(class="el-icon-delete delete" @click="showDeleteModal(scope.row)" title="Delete Raw")
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';

@Component
export default class RecordList extends Vue {
  @Prop(Function) private showEditModal: any;
  @Prop(Function) private hideHashKey: any;
  @Prop(Function) private showDeleteModal: any;
  @Prop(Function) private showGroupDeleteModal: any;
  @Prop(Function) private handleRowSelection: any;
  @Prop(Array) private list!: any[];
  @Prop(Number) private selectedItems!: number;
  @Prop(Array) private header!: any[];
  @Prop(Object) private keys!: { hashKey: string; rangeKey: string };
  @Prop({ type: Number, default: 0 }) private indexOffset!: number;

  private indexMethod(index: number) {
    return index + this.indexOffset + 1;
  }

  private compareByProp(a: any, b: any, prop: string) {
    const normalize = (value: any) => {
      if (value === undefined || value === null || value === '') {
        return { empty: true, rank: 3, value: '' };
      }
      if (typeof value === 'boolean' || value === 'true' || value === 'false') {
        return { empty: false, rank: 0, value: value === true || value === 'true' };
      }
      const numValue = Number(value);
      if (typeof value !== 'object' && !Number.isNaN(numValue)) {
        return { empty: false, rank: 1, value: numValue };
      }
      return { empty: false, rank: 2, value: String(value) };
    };
    const left = normalize(a[prop]);
    const right = normalize(b[prop]);
    if (left.empty || right.empty) {
      return left.empty === right.empty ? 0 : (left.empty ? 1 : -1);
    }
    if (left.rank === right.rank) {
      if (left.rank === 2) {
        return (left.value as string).localeCompare(right.value as string, undefined, { sensitivity: 'base', numeric: true });
      }
      return left.value > right.value ? 1 : (left.value < right.value ? -1 : 0);
    }
    return left.rank - right.rank;
  }
}
</script>

<style lang="stylus" scoped>
.key
  margin-left 5px

.delete-column
  width 100%
  text-align center
  display block
  font-size 1.2em

.delete:hover
  color #ff6d6d
  cursor pointer

.delete-selected
  display flex
  justify-content center
  align-items center

.delete-selected i
  color #ff6d6d
  cursor pointer

.delete-selected i:hover
  color #ff4747
  cursor pointer

.delete-selected i
  font-size 1.6em

.el-table
  width 100%
  font-size .9em
  color #eee
  padding-bottom 50px

.table
  width 98%
  overflow auto
  height 80vh
  margin auto
</style>
