import { MutationTree } from 'vuex';
import { RootState } from './types';
import DynamoDB from 'aws-sdk/clients/dynamodb';
import { AwsConnection } from '@/utils/desktop';

function getEndpoint(region: string) {
  return region === 'cn-north-1' || region === 'cn-northwest-1'
    ? `https://dynamodb.${region}.amazonaws.com.cn`
    : `https://dynamodb.${region}.amazonaws.com`;
}

function initialState(state: RootState) {
  state.dbInstance = new DynamoDB();
  state.dbClient = new DynamoDB.DocumentClient();
  state.currentTable = '';
  state.currentDb = '';
  state.currentRegion = '';
  state.connectionType = '';
  state.credentialsExpireAt = '';
  state.tables = [];
  state.filterText = '';
  state.loading = false;
  state.tableListLoading = false;
  state.response = {
    title: '',
    type: '',
    message: '',
  };
}

function showResponse(state: RootState, response: any) {
  if (typeof response === 'object') {
    state.response.title = 'Error';
    state.response.type = 'error';
    if (
      response.message &&
      response.message.toLowerCase() === 'network failure'
    ) {
      state.response.message = `Network failure. Can't process your request.`;
      return;
    }
    state.response.message = response.message;
  } else {
    state.response.title = 'Success';
    state.response.type = 'success';
    state.response.message = response;
  }
}

function notified(state: RootState) {
  state.response = {
    title: '',
    type: '',
    message: '',
  };
}

function setDBInstancesFromData(state: RootState, database: any) {
  state.dbInstance = new DynamoDB(database.configs);
  state.dbClient = new DynamoDB.DocumentClient(database.configs);
  state.currentDb = database.name;
  state.currentRegion = database.configs.region;
  state.connectionType = 'saved';
  state.credentialsExpireAt = '';
  state.tables = [];
  state.currentTable = '';
}

function setDBInstancesFromProfile(
  state: RootState,
  payload: { connection: AwsConnection; preserveState?: boolean },
) {
  const { connection, preserveState } = payload;
  const configs = {
    region: connection.region,
    accessKeyId: connection.accessKeyId,
    secretAccessKey: connection.secretAccessKey,
    sessionToken: connection.sessionToken,
    endpoint: getEndpoint(connection.region),
    maxRetries: 1,
    dynamoDbCrc32: false,
  };
  state.dbInstance = new DynamoDB(configs);
  state.dbClient = new DynamoDB.DocumentClient(configs);
  state.currentDb = connection.name;
  state.currentRegion = connection.region;
  state.connectionType = 'profile';
  state.credentialsExpireAt = connection.expiration || '';
  if (!preserveState) {
    state.tables = [];
    state.currentTable = '';
    state.filterText = '';
  }
}

function removeDbFromState(state: RootState) {
  state.tables = [];
  state.currentTable = '';
  state.currentDb = '';
  state.currentRegion = '';
  state.connectionType = '';
  state.credentialsExpireAt = '';
  state.dbInstance = new DynamoDB();
  state.dbClient = new DynamoDB.DocumentClient();
}

function setTableNames(state: RootState, tableNames: any[]) {
  state.tables = tableNames;
}

function deleteFromList(state: RootState, tableName: string) {
  state.tables = state.tables.filter((table: any) => table !== tableName);
  state.currentTable = '';
}

function loading(state: RootState, isLoading: boolean) {
  if (isLoading) {
    setTimeout(() => {
      if (!state.loading) {
        state.loading = true;
        setTimeout(() => {
          state.loading = false;
        }, 500);
      }
    }, 500);
  }
  state.loading = isLoading;
}

function tableListLoading(state: RootState, isLoading: boolean) {
  state.tableListLoading = isLoading;
}

function setCurrentTable(state: RootState, tableName: string) {
  state.currentTable = tableName;
}

function filterTextChange(state: RootState, filterField: any) {
  state.filterText = filterField;
}

const mutations: MutationTree<RootState> = {
  initialState,
  showResponse,
  setDBInstancesFromData,
  setDBInstancesFromProfile,
  removeDbFromState,
  setTableNames,
  deleteFromList,
  loading,
  tableListLoading,
  setCurrentTable,
  notified,
  filterTextChange,
};

export default mutations;
