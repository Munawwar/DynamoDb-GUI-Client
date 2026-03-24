export interface RecordModuleState {
  showCreateModal: boolean;
  showDeleteModal: boolean;
  showGroupDeleteModal: boolean;
  recordMeta: any;
  hashKey: string;
  rangeKey: string;
  header: any[];
  headerType: {
    [header: string]: string;
  };
  data: any[];
  filtered: true | undefined;
  limit: number | undefined;
  lastEvaluatedKeyIndex: number;
  evaluatedKeys: any[];
  selectedRows: any[];
  groupDelete: any[];
  retry: number;
  filterParams: FilterParams;
  advancedFilter: AdvancedFilter;
  useAdvancedFilter: boolean;
  paginationMode: 'server' | 'client';
  scanning: boolean;
  scanGeneration: number;
  scanRowCount: number;
  bufferPageIndex: number;
}

export interface FilterParams {
  filterColumn: string;
  filterExpr: string;
  filterValue: string | boolean | number | null;
  valueType: string;
  types: string[];
  expressions: string[];
}

export interface FilterCondition {
  column: string;
  expr: string;
  value: string | boolean | number | null;
  valueType: string;
}

export type LogicalOperator = 'AND' | 'OR';

export interface AdvancedFilter {
  conditions: FilterCondition[];
  logicalOperator: LogicalOperator;
}
