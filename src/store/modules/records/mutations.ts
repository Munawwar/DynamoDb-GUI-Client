import { MutationTree } from 'vuex';
import { RecordModuleState } from './types';

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
        row[key] += '';
      }
    }
  }
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
      state.filterParams.filterValue =
        state.filterParams.filterValue === state.filterParams.filterValue;
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

export const INITIAL_LIMIT = 15;

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
};

export default mutations;
