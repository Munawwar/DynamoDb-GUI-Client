import { ActionContext, ActionTree } from 'vuex';
import { RootState } from './types';
import { getLoginCommand, resolveProfile } from '@/utils/desktop';
import { decrypt } from '@/utils/crypto';

function expiresSoon(expiresAt: string) {
  return !expiresAt || Date.parse(expiresAt) - Date.now() < 5 * 60 * 1000;
}

async function getCredentialError(err: any, profile: string) {
  const message = (err && err.message) || String(err);
  const loginCommand = await getLoginCommand(profile);
  return {
    message: `${message}\n${loginCommand}, then reconnect.`,
  };
}

async function getCurrentDb(
  { commit, dispatch, rootState }: ActionContext<RootState, RootState>,
  name: string,
) {
  const mp = (rootState as any).masterPassword;
  const raw = localStorage.getItem(`${name}-db`);
  if (!raw) { return; }
  try {
    const decrypted = await decrypt(raw, mp.password, mp.salt);
    const database = JSON.parse(decrypted);
    commit('setDBInstancesFromData', database);
  } catch (err) {
    commit('showResponse', { message: 'Failed to decrypt database credentials.' });
    return;
  }
  localStorage.setItem('__last_db', name);
  dispatch('getDbTables');
}

async function getCurrentProfile(
  { commit, dispatch }: ActionContext<RootState, RootState>,
  name: string,
) {
  try {
    const connection = await resolveProfile(name);
    commit('database/setSelectedProfile', name, { root: true });
    commit('setDBInstancesFromProfile', { connection });
  } catch (err) {
    commit('showResponse', await getCredentialError(err, name));
    return;
  }
  localStorage.setItem('__last_profile', name);
  dispatch('getDbTables');
}

async function getDbTables(
  { state, commit, dispatch }: ActionContext<RootState, RootState>,
  tableToGet: string,
) {
  if (!(await dispatch('ensureCurrentDb'))) {
    return;
  }
  let data;
  try {
    data = await getTablesPaginated(state);
  } catch (err) {
    commit('showResponse', err);
    return;
  }
  if (data.TableNames && !data.TableNames.length) {
    commit('records/initialState');
    commit('table/setTableMeta', {});
  } else {
    commit('setTableNames', data.TableNames);
    tableToGet && dispatch('getCurrentTable', tableToGet);
  }
}

async function ensureCurrentDb(
  { state, commit }: ActionContext<RootState, RootState>,
) {
  if (!state.currentDb || state.connectionType !== 'profile' || !expiresSoon(state.credentialsExpireAt)) {
    return !!state.currentDb;
  }
  try {
    const connection = await resolveProfile(state.currentDb);
    commit('setDBInstancesFromProfile', { connection, preserveState: true });
    return true;
  } catch (err) {
    commit('showResponse', await getCredentialError(err, state.currentDb));
    return false;
  }
}

async function getTablesPaginated(state: any) {
  const params: any = {};
  const data: { TableNames: string[] } = { TableNames: [] };
  do {
    const chunk = await state.dbInstance.listTables(params).promise();
    if (chunk.LastEvaluatedTableName) {
      params.ExclusiveStartTableName = chunk.LastEvaluatedTableName;
    } else {
      delete params.ExclusiveStartTableName;
    }
    data.TableNames = [...data.TableNames, ...chunk.TableNames];
  } while (params.ExclusiveStartTableName);
  return data;
}

function deleteTableFromStore(
  { commit }: ActionContext<RootState, RootState>,
  tableName: string,
) {
  commit('deleteFromList', tableName);
  commit('records/initialState');
  commit('table/setTableMeta', '');
}

function getCurrentTable(
  { commit, dispatch }: ActionContext<RootState, RootState>,
  tableName: string,
) {
  commit('setCurrentTable', tableName);
  commit('records/initialState');
  commit('table/setTableMeta', '');
  dispatch('records/getRecords');
}

const actions: ActionTree<RootState, RootState> = {
  getCurrentDb,
  getCurrentProfile,
  ensureCurrentDb,
  getCurrentTable,
  deleteTableFromStore,
  getDbTables,
};

export default actions;
