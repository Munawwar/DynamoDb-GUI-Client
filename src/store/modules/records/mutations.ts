import { MutationTree } from 'vuex';
import { RecordModuleState, FilterCondition, LogicalOperator } from './types';
import { initialAdvancedFilter } from './state';

// Non-reactive buffers to avoid Vue 2 observer overhead during scanning
let scanBufferRaw: any[] = [];
let scanHeaderSet: Set<string> = new Set();
let scanHeaderType: { [key: string]: string } = {};

function toggleCreateModal(state: RecordModuleState) {
  state.showCreateModal = !state.showCreateModal;
}

function toggleDeleteModal(state: RecordModuleState) {
  state.showDeleteModal = !state.showDeleteModal;
}

function toggleGroupDeleteModal(state: RecordModuleState) {
  state.showGroupDeleteModal = !state.showGroupDeleteModal;
}

function setMeta(state: RecordModuleState, meta: string) {
  state.recordMeta = meta;
}

function setFilterStatus(state: RecordModuleState) {
  state.filtered = true;
}

function setGroupDeleteItems(state: RecordModuleState, val: any) {
  state.groupDelete = val;
  state.retry++;
}

async function selectRows(state: RecordModuleState, val: any) {
  const newSelection = [];
  state.groupDelete = [];
  for (const item of val) {
    const requestItem: {
      DeleteRequest: {
        Key: any;
      };
    } = {
      DeleteRequest: {
        Key: {},
      },
    };
    for (const key in item) {
      if (key !== state.hashKey && key !== state.rangeKey) {
        continue;
      } else {
        requestItem.DeleteRequest.Key[key] = item[key];
      }
    }
    newSelection.push(requestItem);
  }
  /*
    Splitting selected rows, into arrays of maximum 25 rows, for sending them
    with batchWrite function.
  */
  const chunk = 25;
  for (let i = 0; i < newSelection.length; i += chunk) {
    state.groupDelete.push(newSelection.slice(i, i + chunk));
  }
  state.selectedRows = val;
}
function extractKeys(state: RecordModuleState, schema: any) {
  state.hashKey = '';
  state.rangeKey = '';
  for (const item of schema.KeySchema) {
    for (const key in item) {
      if (item[key] === 'HASH') {
        state.hashKey = item.AttributeName;
      } else if (item[key] === 'RANGE') {
        state.rangeKey = item.AttributeName;
      }
    }
  }
}

function setHeader(state: RecordModuleState) {
  const extractData = state.data;
  state.header = [];
  state.headerType = {};
  for (const row of extractData) {
    // tslint:disable-next-line:forin
    for (const key in row) {
      if (!state.header.includes(key)) {
        state.header.push(key);
      }
      if (
        !state.headerType[key] &&
        !['object', 'undefined'].includes(typeof row[key]) // includes null
      ) {
        state.headerType[key] = typeof row[key];
      }
      if (typeof row[key] === 'object') {
        row[key] = JSON.stringify(row[key]);
      } else if (
        typeof row[key] === 'boolean' ||
        typeof row[key] === 'undefined'
      ) {
        row[key] = String(row[key]);
      }
    }
  }
  state.header.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base', numeric: true }));
}

function setData(state: RecordModuleState, data: any[]) {
  state.data = data;
}

function setLimit(state: RecordModuleState, limit: any) {
  if (limit < 0) {
    limit = 1;
  }
  state.limit = limit && Number(limit);
}

function setPaginationMode(state: RecordModuleState, mode: 'server' | 'client') {
  state.paginationMode = mode;
  if (mode === 'server') {
    scanBufferRaw = [];
    state.scanRowCount = 0;
    state.bufferPageIndex = 0;
  }
}

function changeFilterValueType(state: RecordModuleState) {
  switch (state.filterParams.valueType) {
    case 'string':
      state.filterParams.filterValue =
        state.filterParams.filterValue &&
        state.filterParams.filterValue.toString();
      break;
    case 'number':
      state.filterParams.filterValue = Number(state.filterParams.filterValue);
      break;
    case 'null':
      state.filterParams.filterValue = null;
      break;
    case 'boolean':
      state.filterParams.filterValue = state.filterParams.filterValue === true;
      break;
  }
}

function setFilterColumn(state: RecordModuleState, item: {value: string}) {
  const key = item.value;
  if (state.headerType[key]) {
    // set data type and filter list
    state.filterParams.valueType = state.headerType[key];
    setFilterValueType(state, state.filterParams.valueType);
  }
}

function setFilterValueType(state: RecordModuleState, valueType: string) {
  switch (valueType) {
    case 'string':
      state.filterParams.expressions = ['=', '!=', '<', '>', '<=', '>=', 'begins_with', 'contains', 'not contains'];
      break;
    case 'number':
      state.filterParams.expressions = ['=', '!=', '<', '>', '<=', '>='];
      break;
    case 'null':
      if (state.filterParams.filterExpr !== '<>') {
        state.filterParams.filterExpr = '=';
      }
      state.filterParams.expressions = ['=', '!='];
      state.filterParams.filterValue = null;
      break;
    case 'boolean':
      if (state.filterParams.filterExpr !== '<>') {
        state.filterParams.filterExpr = '=';
      }
      state.filterParams.expressions = ['=', '!='];
      state.filterParams.filterValue = true;
      break;
  }
}

function setNotEqualExpr(state: RecordModuleState, expr: string) {
  if (expr === '!=') {
    state.filterParams.filterExpr = '<>';
  }
}

function setUseAdvancedFilter(state: RecordModuleState, value: boolean) {
  state.useAdvancedFilter = value;
}

function setLogicalOperator(state: RecordModuleState, op: LogicalOperator) {
  state.advancedFilter.logicalOperator = op;
}

function addFilterCondition(state: RecordModuleState) {
  state.advancedFilter.conditions.push({ column: '', expr: '=', value: '', valueType: '' });
}

function removeFilterCondition(state: RecordModuleState, index: number) {
  if (state.advancedFilter.conditions.length > 1) {
    state.advancedFilter.conditions.splice(index, 1);
  }
}

function updateFilterCondition(
  state: RecordModuleState,
  payload: { index: number; field: keyof FilterCondition; value: any },
) {
  const condition = state.advancedFilter.conditions[payload.index];
  if (condition) {
    (condition as any)[payload.field] = payload.value;
  }
}

function resetAdvancedFilter(state: RecordModuleState) {
  state.advancedFilter = {
    ...initialAdvancedFilter,
    conditions: [{ column: '', expr: '=', value: '', valueType: '' }],
  };
  state.useAdvancedFilter = false;
}

function startScan(state: RecordModuleState) {
  state.scanGeneration++;
  state.scanning = true;
  scanBufferRaw = [];
  scanHeaderSet = new Set();
  scanHeaderType = {};
  state.scanRowCount = 0;
}

function cancelScan(state: RecordModuleState) {
  state.scanGeneration++;
  state.scanning = false;
}

function finishScan(state: RecordModuleState) {
  state.scanning = false;
}

function appendData(state: RecordModuleState, items: any[]) {
  // All work here is on non-reactive data — only scanRowCount triggers Vue
  for (const row of items) {
    for (const key of Object.keys(row)) {
      scanHeaderSet.add(key);
      if (
        !scanHeaderType[key] &&
        !['object', 'undefined'].includes(typeof row[key])
      ) {
        scanHeaderType[key] = typeof row[key];
      }
      if (typeof row[key] === 'object') {
        row[key] = JSON.stringify(row[key]);
      } else if (
        typeof row[key] === 'boolean' ||
        typeof row[key] === 'undefined'
      ) {
        row[key] = String(row[key]);
      }
    }
    scanBufferRaw.push(row);
  }
  state.scanRowCount = scanBufferRaw.length;
}

export const CLIENT_PAGE_SIZE_DEFAULT = 500;

function getClientPageSize(state: RecordModuleState): number {
  return state.limit || CLIENT_PAGE_SIZE_DEFAULT;
}

function flushScanBuffer(state: RecordModuleState) {
  state.bufferPageIndex = 0;
  state.header = Array.from(scanHeaderSet).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base', numeric: true }));
  state.headerType = { ...scanHeaderType };
  const pageSize = getClientPageSize(state);
  state.data = scanBufferRaw.slice(0, pageSize);
}

function bufferPageNext(state: RecordModuleState) {
  const pageSize = getClientPageSize(state);
  const maxPage = Math.ceil(scanBufferRaw.length / pageSize) - 1;
  if (state.bufferPageIndex < maxPage) {
    state.bufferPageIndex++;
    const start = state.bufferPageIndex * pageSize;
    state.data = scanBufferRaw.slice(start, start + pageSize);
  }
}

function bufferPagePrev(state: RecordModuleState) {
  const pageSize = getClientPageSize(state);
  if (state.bufferPageIndex > 0) {
    state.bufferPageIndex--;
    const start = state.bufferPageIndex * pageSize;
    state.data = scanBufferRaw.slice(start, start + pageSize);
  }
}

function addItemToList(state: RecordModuleState, newItem: any) {
  let edited = false;
  state.data = state.data.map((item) => {
    if (
      item[state.rangeKey] === newItem[state.rangeKey] &&
      item[state.hashKey] === newItem[state.hashKey]
    ) {
      edited = true;
      return newItem;
    }
    return item;
  });
  !edited && state.data.push(newItem);
}

function deleteItemFromList(state: RecordModuleState, deletedItem: any) {
  state.data = state.data.filter((item) => {
    if (item[state.hashKey] !== deletedItem[state.hashKey]) {
      return item;
    } else if (state.rangeKey) {
      return item[state.rangeKey] !== deletedItem[state.rangeKey];
    }
  });
}

export const INITIAL_LIMIT = 100;

function initialState(state: RecordModuleState) {
  state.limit = INITIAL_LIMIT;
  state.retry = 0;
  state.recordMeta = {};
  state.hashKey = '';
  state.rangeKey = '';
  state.filtered = undefined;
  state.data = [];
  state.header = [];
  state.headerType = {};
  state.evaluatedKeys = [];
  state.lastEvaluatedKeyIndex = 0;
  state.selectedRows = [];
  state.filterParams = {
    filterColumn: '',
    filterExpr: '=',
    filterValue: '',
    valueType: '',
    types: ['number', 'string', 'null', 'boolean'],
    expressions: ['=', '!=', '<', '>', '<=', '>=', 'begins_with', 'contains', 'not contains'],
  };
  state.advancedFilter = {
    ...initialAdvancedFilter,
    conditions: [{ column: '', expr: '=', value: '', valueType: '' }],
  };
  state.useAdvancedFilter = false;
  state.paginationMode = 'server';
  state.scanning = false;
  state.scanGeneration++;
  scanBufferRaw = [];
  scanHeaderSet = new Set();
  scanHeaderType = {};
  state.scanRowCount = 0;
  state.bufferPageIndex = 0;
}

function addEvaluatedKey(state: RecordModuleState, lastEvaluatedKey: any) {
  !state.evaluatedKeys.some((item: any) => {
    return item === lastEvaluatedKey;
  }) && state.evaluatedKeys.push(lastEvaluatedKey || {});
}

function clearEvaluatedKeys(state: RecordModuleState) {
  state.evaluatedKeys = [];
  state.lastEvaluatedKeyIndex = 0;
}

function lastEvaluatedKeyIndexInc(state: RecordModuleState) {
  state.lastEvaluatedKeyIndex++;
}

function lastEvaluatedKeyIndexDec(state: RecordModuleState) {
  state.lastEvaluatedKeyIndex--;
}

const mutations: MutationTree<RecordModuleState> = {
  toggleCreateModal,
  toggleDeleteModal,
  toggleGroupDeleteModal,
  setGroupDeleteItems,
  setData,
  addEvaluatedKey,
  setHeader,
  extractKeys,
  setMeta,
  addItemToList,
  initialState,
  deleteItemFromList,
  lastEvaluatedKeyIndexInc,
  lastEvaluatedKeyIndexDec,
  clearEvaluatedKeys,
  setLimit,
  setFilterColumn,
  setFilterValueType,
  changeFilterValueType,
  setNotEqualExpr,
  setFilterStatus,
  selectRows,
  setUseAdvancedFilter,
  setLogicalOperator,
  addFilterCondition,
  removeFilterCondition,
  updateFilterCondition,
  resetAdvancedFilter,
  startScan,
  cancelScan,
  finishScan,
  appendData,
  flushScanBuffer,
  bufferPageNext,
  bufferPagePrev,
  setPaginationMode,
};

export default mutations;
