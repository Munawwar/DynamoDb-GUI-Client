<template lang="pug">
  el-row(class="filters" type="flex")
    .scan-container
      //- Summary strip when advanced filter is active
      .scan.scan-summary(v-if="useAdvancedFilter && filtered")
        el-button(type="danger" plain icon="el-icon-close" title="Clear Filters" @click="clearAdvancedFilter")
        span.advanced-summary {{ advancedFilter.conditions.length }} filter{{ advancedFilter.conditions.length > 1 ? 's' : '' }} ({{ advancedFilter.logicalOperator }}) active
        el-button(type="primary" plain icon="el-icon-edit" title="Edit Filters" @click="showDialog = true") Edit
      //- Normal inline single-filter bar
      .scan(v-else)
        el-autocomplete(:fetch-suggestions="getKeys" v-model="filterParams.filterColumn" placeholder="Key" @select="setFilterColumn")
          el-button(v-if="filtered" type="danger" slot="prepend" plain icon="el-icon-close" title="Disable Filter" @click="refreshTable")
        el-select(v-model="filterParams.filterExpr" collapse-tags placeholder="Expression" @change="setNotEqualExpr")
          el-option(v-for="expression in filterParams.expressions" :key="expression" :label="expression" :value="expression") {{expression}}
        el-select(v-model="filterParams.valueType" collapse-tags placeholder="Type" @change="setFilterValueType")
          el-option(v-for="attributeType in filterParams.types" :key="attributeType" :label="attributeType" :value="attributeType") {{attributeType}}
        el-select(v-if="filterParams.valueType === 'boolean'" v-model="filterParams.filterValue" placeholder="Boolean")
          el-option(:value="true") {{'true'}}
          el-option(:value="false") {{'false'}}
        el-input(v-if="filterParams.valueType !== 'boolean'" :placeholder="filterParams.valueType !== 'null' ? 'Value' : 'Not Available'" v-model="filterParams.filterValue" :disabled="filterParams.valueType === 'null'" spellcheck="false")
        el-button(type="success" plain icon="el-icon-search" class="scan-button" title="Scan Table" @click="filterRecords")
          span(class="hidden-xs-only") Scan
        el-button(type="primary" plain icon="el-icon-plus" class="advanced-button" title="Advanced Filter" @click="openAdvancedDialog")

    //- Advanced Filter Dialog
    el-dialog(title="Advanced Filter" :visible.sync="showDialog" width="720px" :close-on-click-modal="false")
      .advanced-filter-body
        .logical-operator-row
          span Combine conditions with:
          el-radio-group(v-model="advancedFilter.logicalOperator" size="small")
            el-radio-button(label="AND") AND
            el-radio-button(label="OR") OR

        .condition-rows
          .condition-row(v-for="(condition, index) in advancedFilter.conditions" :key="index")
            span.condition-index {{ index + 1 }}.
            el-autocomplete.condition-column(
              :fetch-suggestions="getKeys"
              v-model="condition.column"
              placeholder="Key"
              @select="(item) => onConditionColumnSelect(index, item)"
              size="small"
            )
            el-select.condition-expr(v-model="condition.expr" placeholder="Expression" size="small")
              el-option(v-for="expr in expressionsForType(condition.valueType)" :key="expr" :label="expr" :value="expr")
            el-select.condition-type(v-model="condition.valueType" placeholder="Type" size="small" @change="(val) => onConditionTypeChange(index, val)")
              el-option(v-for="t in typeOptions" :key="t" :label="t" :value="t")
            el-select.condition-value(v-if="condition.valueType === 'boolean'" v-model="condition.value" placeholder="Boolean" size="small")
              el-option(:value="true") true
              el-option(:value="false") false
            el-input.condition-value(
              v-else
              v-model="condition.value"
              :placeholder="condition.valueType !== 'null' ? 'Value' : 'N/A'"
              :disabled="condition.valueType === 'null'"
              size="small"
              spellcheck="false"
            )
            el-button(
              type="danger"
              plain
              icon="el-icon-minus"
              size="mini"
              circle
              :disabled="advancedFilter.conditions.length <= 1"
              @click="removeCondition(index)"
            )

        el-button(type="primary" plain icon="el-icon-plus" size="small" @click="addCondition") Add Condition

      span(slot="footer")
        el-button(@click="showDialog = false") Cancel
        el-button(type="success" plain icon="el-icon-search" class="scan-button" @click="applyAdvancedFilter") Apply & Scan
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import { FilterParams, AdvancedFilter } from '../store/modules/records/types';

@Component
export default class RecordListFilter extends Vue {
  @Prop(Function) private getKeys: any;
  @Prop(Function) private filterRecords: any;
  @Prop(Function) private filterAdvancedRecords: any;
  @Prop(Function) private setFilterColumn: any;
  @Prop(Function) private setFilterValueType: any;
  @Prop(Function) private setNotEqualExpr: any;
  @Prop(Function) private refreshTable: any;
  @Prop(Function) private addCondition: any;
  @Prop(Function) private removeCondition: any;
  @Prop(Function) private resetAdvancedFilter: any;
  @Prop(Boolean) private filtered!: boolean;
  @Prop(Boolean) private useAdvancedFilter!: boolean;
  @Prop(Object) private filterParams!: FilterParams;
  @Prop(Object) private advancedFilter!: AdvancedFilter;
  @Prop(Object) private headerType!: { [key: string]: string };

  private showDialog: boolean = false;

  private typeOptions: string[] = ['number', 'string', 'null', 'boolean'];

  private allExpressions: string[] = ['=', '!=', '<', '>', '<=', '>=', 'begins_with', 'contains', 'not contains'];

  private expressionsForType(valueType: string): string[] {
    switch (valueType) {
      case 'number': return ['=', '!=', '<', '>', '<=', '>='];
      case 'boolean':
      case 'null': return ['=', '!='];
      default: return this.allExpressions;
    }
  }

  private onConditionColumnSelect(index: number, item: { value: string }) {
    const condition = this.advancedFilter.conditions[index];
    if (condition && this.headerType && this.headerType[item.value]) {
      condition.valueType = this.headerType[item.value];
    }
  }

  private onConditionTypeChange(index: number, valueType: string) {
    const condition = this.advancedFilter.conditions[index];
    if (!condition) { return; }
    if (valueType === 'null') {
      condition.value = null;
      condition.expr = '=';
    } else if (valueType === 'boolean') {
      condition.value = true;
      condition.expr = '=';
    }
  }

  private openAdvancedDialog() {
    // Pre-populate first condition from inline bar if it has data
    if (
      this.filterParams.filterColumn &&
      this.advancedFilter.conditions.length === 1 &&
      !this.advancedFilter.conditions[0].column
    ) {
      const first = this.advancedFilter.conditions[0];
      first.column = this.filterParams.filterColumn;
      first.expr = this.filterParams.filterExpr;
      first.value = this.filterParams.filterValue;
      first.valueType = this.filterParams.valueType;
    }
    this.showDialog = true;
  }

  private applyAdvancedFilter() {
    this.showDialog = false;
    this.filterAdvancedRecords();
  }

  private clearAdvancedFilter() {
    this.resetAdvancedFilter();
    this.refreshTable();
  }
}
</script>

<style lang="stylus" scoped>
.filters
  width 98%
  margin auto
  margin-bottom 5px

.scan-container
  margin-left -1.5px
  width 100%

.scan
  display flex
  justify-content flex-start
  align-items center

.scan > *
  margin 0 1.5px
  flex: 1 1 min-content;

.el-autocomplete
  min-width 50px
  max-width 200px

.el-select
  min-width 50px
  max-width 120px

.el-input
  min-width 50px
  max-width 200px

.scan-button
  border 1px solid #191d25 !important
  border-radius 0
  margin-left -10px
  max-width max-content

.advanced-button
  border 1px solid #191d25 !important
  border-radius 0
  max-width max-content

.scan-summary > *
  flex 0 0 auto !important

.advanced-summary
  color #e6e6e6
  font-size 13px
  margin 0 10px
  white-space nowrap

.advanced-filter-body
  .logical-operator-row
    margin-bottom 15px
    display flex
    align-items center
    gap 10px
    span
      color #ccc
      font-size 13px

.condition-rows
  margin-bottom 10px

.condition-row
  display flex
  align-items center
  gap 6px
  margin-bottom 8px

.condition-index
  color #999
  font-size 12px
  min-width 20px

.condition-column
  flex 2

.condition-expr
  flex 1.5

.condition-type
  flex 1

.condition-value
  flex 2
</style>
