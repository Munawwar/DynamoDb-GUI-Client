import { GetterTree } from 'vuex';
import { RecordModuleState, FilterCondition } from './types';
import { RootState } from '@/store/types';

const keys = (state: RecordModuleState) => {
  return {
    hashKey: state.hashKey,
    rangeKey: state.rangeKey,
  };
};

const tableDataPage = (state: RecordModuleState) => state.data;

const getKeys = (state: RecordModuleState) => (queryString: string | undefined, cb: any) => {
  const searchString = (queryString || '').toLowerCase();
  return cb(
    state.header
      .filter((item) => searchString ? item.toLowerCase().includes(searchString) : true)
      .map((item) => ({ value: item })),
  );
};

const hideHashKey = (state: RecordModuleState) => (el: any) => {
  return el !== state.hashKey && el !== state.rangeKey;
};

const scanIsValid = (state: RecordModuleState) => {
  const {
    filterColumn,
    filterExpr,
    filterValue,
    valueType,
  } = state.filterParams;
  if (!filterColumn || !filterExpr || !valueType) {
    return false;
  }
  if (valueType === 'null') {
    return true;
  }
  if (valueType === 'boolean') {
    return typeof filterValue === 'boolean';
  }
  if (valueType === 'number') {
    return filterValue !== '' && Number.isFinite(Number(filterValue));
  }
  return typeof filterValue === 'string' && filterValue !== '';
};

export function isConditionValid(condition: FilterCondition): boolean {
  if (!condition.column || !condition.expr || !condition.valueType) {
    return false;
  }
  if (condition.valueType === 'null') {
    return true;
  }
  if (condition.valueType === 'boolean') {
    return typeof condition.value === 'boolean';
  }
  if (condition.valueType === 'number') {
    return condition.value !== '' && Number.isFinite(Number(condition.value));
  }
  return typeof condition.value === 'string' && condition.value !== '';
}

const advancedScanIsValid = (state: RecordModuleState) => {
  const { conditions } = state.advancedFilter;
  return conditions.length > 0 && conditions.every(isConditionValid);
};

const itemCount = (_: RecordModuleState, __: any, rootState: any) =>
  rootState.table.tableMeta.ItemCount;

const getters: GetterTree<RecordModuleState, RootState> = {
  keys,
  tableDataPage,
  getKeys,
  scanIsValid,
  advancedScanIsValid,
  hideHashKey,
  itemCount,
};
export default getters;
