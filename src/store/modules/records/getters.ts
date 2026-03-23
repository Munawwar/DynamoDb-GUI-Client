import { GetterTree } from 'vuex';
import { RecordModuleState } from './types';
import { RootState } from '@/store/types';
import getNaturalKeySorter from 'natural-sort-by-key';

const keys = (state: RecordModuleState) => {
  return {
    hashKey: state.hashKey,
    rangeKey: state.rangeKey,
  };
};

const tableDataPage = (state: RecordModuleState) => state.data;

const valueSorter = getNaturalKeySorter('value');

const getKeys = (state: RecordModuleState) => (queryString: string | undefined, cb: any) => {
  const searchString = (queryString || '').toLowerCase();
  return cb(
    state.header
      .filter((item) => searchString ? item.toLowerCase().includes(searchString) : true)
      .map((item) => ({ value: item }))
      .sort(valueSorter),
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

const itemCount = (_: RecordModuleState, __: any, rootState: any) =>
  rootState.table.tableMeta.ItemCount;

const getters: GetterTree<RecordModuleState, RootState> = {
  keys,
  tableDataPage,
  getKeys,
  scanIsValid,
  hideHashKey,
  itemCount,
};
export default getters;
