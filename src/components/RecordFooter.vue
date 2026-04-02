<template lang="pug">
  el-col(:span="24" class="container")
    el-col(:span="18")
      i(class="el-icon-circle-plus-outline add" @click="generateMeta" title="Add Record")
      i(class="el-icon-refresh refresh" @click="refreshTable" title="Refresh Table")
      el-popover(
        placement="top"
        width="260"
        v-model="visible")
        .popover-content
          i(class="el-icon-close popover-close-icon" role="button" aria-label="Close settings" @click="visible = false")
          el-row
            el-row(class="popover-row popover-label") Pagination
            el-row(class="popover-row")
              el-radio-group(v-model="records.paginationMode" size="small" @change="onPaginationModeChange")
                el-radio-button(label="server") Server-side
                el-radio-button(label="client")
                  span Client-side
                  el-tooltip(content="Scans entire table and paginates locally" placement="top")
                    i(class="el-icon-warning warning-icon")
            el-row(class="popover-row popover-label") {{ records.paginationMode === 'server' ? 'Scan rows per page' : 'Rows per page' }}
            el-row(class="popover-row")
              el-input(placeholder="Row Count" @change="onRowsPerPageChange" v-model="records.limit" spellcheck="false")
        i(class="el-icon-setting settings" slot="reference" title="Table Settings")
      template(v-if="records.scanning")
        span.scan-status Scanning... ({{ records.scanRowCount }} rows)
        el-button(type="danger" size="mini" plain @click="cancelScan") Cancel
      template(v-else-if="hasBuffer")
        i(
          class="el-icon-arrow-left"
          :class="{disabled: records.bufferPageIndex < 1}"
          @click="records.bufferPageIndex >= 1 && bufferPagePrev()"
          )
        .pageIndex {{ records.bufferPageIndex + 1 }} / {{ bufferTotalPages }}
        i(
          class="el-icon-arrow-right"
          :class="{disabled: records.bufferPageIndex >= bufferTotalPages - 1}"
          @click="records.bufferPageIndex < bufferTotalPages - 1 && bufferPageNext()"
          )
        span.scan-status {{ records.scanRowCount }} rows total
      template(v-else)
        i(
          class="el-icon-arrow-left"
          :class="{disabled: records.lastEvaluatedKeyIndex < 1}"
          @click="records.lastEvaluatedKeyIndex >= 1 && getPreviousRecords()"
          )
        .pageIndex(
        ) {{ records.lastEvaluatedKeyIndex + 1 }}
        i(
          class="el-icon-arrow-right"
          :class="{disabled: (records.lastEvaluatedKeyIndex + 1) * records.limit >= itemCount || records.evaluatedKeys.length < 1}"
          @click="(records.lastEvaluatedKeyIndex + 1) * records.limit < itemCount && records.evaluatedKeys.length > 0 && getNextRecords()"
          )
        .filter-result(v-if="records.filtered") {{list.length}} matches in {{ records.limit * records.lastEvaluatedKeyIndex + 1 }} - {{ (records.lastEvaluatedKeyIndex + 1) * records.limit > itemCount ? itemCount : (records.lastEvaluatedKeyIndex + 1) * records.limit}} range
    el-col(:span="6" class="itemCount") {{itemCount ? itemCount : 0}} rows in {{currentTable}}
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';

@Component
export default class RecordFooter extends Vue {
  private visible: boolean = false;

  get hasBuffer() { return !this.records.scanning && this.records.scanRowCount > 0; }

  get bufferTotalPages() {
    return Math.ceil(this.records.scanRowCount / (this.records.limit || 500)) || 1;
  }

  @Prop(Function) private generateMeta: any;
  @Prop(Function) private refreshTable: any;
  @Prop(Function) private getNextRecords: any;
  @Prop(Object) private records!: any;
  @Prop(Function) private getPreviousRecords: any;
  @Prop(Function) private getLimitedRows: any;
  @Prop(Function) private cancelScan: any;
  @Prop(Function) private bufferPageNext: any;
  @Prop(Function) private bufferPagePrev: any;
  @Prop(Function) private setPaginationMode: any;
  @Prop(String) private currentTable!: string;
  @Prop(Number) private itemCount!: number;
  @Prop(Array) private list!: any[];

  private onPaginationModeChange(mode: string) {
    this.setPaginationMode(mode);
    this.getLimitedRows(this.records.limit || 100);
  }

  private onRowsPerPageChange(val: any) {
    this.getLimitedRows(val);
  }
}
</script>

<style lang="stylus" scoped>
.popover-content
  position relative
  display flex
  justify-content center
  align-items center
  flex-direction column

.popover-close-icon
  position absolute
  top -10px
  right -10px
  cursor pointer
  color #999
  font-size 14px
  padding 4px !important
  &:hover
    color #fff

.popover-row
  margin-top 8px
  &:first-child
    margin-top 0

.popover-label
  color #aaa
  font-size 12px

.warning-icon
  color #e6a23c
  margin-left 4px
  font-size 14px
  vertical-align middle

/deep/ .is-active .warning-icon
  color #000

.container
  position absolute
  height 30px
  bottom 0
  left 0
  background #121820
  z-index 1000
  padding 0 2px

.filter-result
  display flex

.el-col
  display flex
  align-items center
  height 35px

.el-col i
  cursor pointer
  padding 10px 15px
  font-size 1.2em

.add
  color #00d986

.refresh
  color #409EFF

.settings
  color #fcff84

.add:hover
  color #55ffbe

.refresh:hover
  color #52ceff

.settings:hover
  color #fcffe4

.itemCount
  justify-content flex-end

.disabled
  color #aaaaaa
  cursor not-allowed !important

.scan-status
  color #e6e6e6
  font-size 13px
  padding 0 10px
</style>
