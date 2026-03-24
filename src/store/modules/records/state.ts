import { RecordModuleState, AdvancedFilter } from './types';

export const initialAdvancedFilter: AdvancedFilter = {
  conditions: [{ column: '', expr: '=', value: '', valueType: '' }],
  logicalOperator: 'AND',
};

const state: RecordModuleState = {
  showCreateModal: false,
  showDeleteModal: false,
  showGroupDeleteModal: false,
  recordMeta: {},
  hashKey: '',
  rangeKey: '',
  filtered: undefined,
  data: [],
  header: [],
  headerType: {},
  limit: 100,
  lastEvaluatedKeyIndex: 0,
  evaluatedKeys: [],
  selectedRows: [],
  groupDelete: [],
  retry: 0,
  filterParams: {
    filterColumn: '',
    filterExpr: '=',
    filterValue: '',
    valueType: '',
    types: ['number', 'string', 'isNull', 'boolean'],
    expressions: ['=', '!=', '<', '>', '<=', '>=', 'begins_with', 'contains', 'not contains'],
  },
  advancedFilter: { ...initialAdvancedFilter, conditions: [...initialAdvancedFilter.conditions] },
  useAdvancedFilter: false,
  paginationMode: 'server',
  scanning: false,
  scanGeneration: 0,
  scanRowCount: 0,
  bufferPageIndex: 0,
};

export default state;
