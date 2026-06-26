import { ActionTree, ActionContext } from 'vuex';
import { DatabaseModuleState } from './types';
import { RootState } from '@/store/types';
import DynamoDB from 'aws-sdk/clients/dynamodb';
import { encrypt, decrypt } from '@/utils/crypto';
import { listProfiles } from '@/utils/desktop';

function getMasterPassword(rootState: any): { password: string; salt: ArrayBuffer } {
  return {
    password: rootState.masterPassword.password,
    salt: rootState.masterPassword.salt,
  };
}

function removeDbFromStorage(
  { commit, dispatch }: ActionContext<DatabaseModuleState, RootState>,
  db: any,
) {
  localStorage.removeItem(`${db.name}-db`);
  commit('removeDbFromState', null, { root: true });
  dispatch('getDbList');
}

async function setCredentials({
  commit,
  dispatch,
  getters,
  state,
  rootState,
}: ActionContext<DatabaseModuleState, RootState>) {
  const database = state.submitForm;
  if (!getters.validateForm) {
    return;
  }

  const currentDb = rootState.currentDb;
  const isEditingCurrentDb = state.showEditModal && currentDb;
  const existingRaw = localStorage.getItem(`${database.name}-db`);
  if (existingRaw && (!isEditingCurrentDb || database.name !== currentDb)) {
    commit(
      'showResponse',
      { message: 'Database with that name already exists' },
      { root: true },
    );
    return;
  }
  if (isEditingCurrentDb) {
    localStorage.removeItem(`${currentDb}-db`);
  }

  const DB = new DynamoDB({ ...database.configs });
  try {
    await DB.listTables().promise();
  } catch (err) {
    commit('showResponse', err, { root: true });
    return;
  }
  database.createdAt = +new Date();

  const { password, salt } = getMasterPassword(rootState);
  const encrypted = await encrypt(JSON.stringify(database), password, salt);
  localStorage.setItem(`${database.name}-db`, encrypted);

  await dispatch('getDbList');
  await dispatch('getCurrentDb', database.name, { root: true });
  commit('setToDefault');
}

async function getDbList({ commit, rootState }: ActionContext<DatabaseModuleState, RootState>) {
  const { password, salt } = getMasterPassword(rootState);
  const newDbList = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)!;
    if (!key.endsWith('-db')) { continue; }
    const value = localStorage.getItem(key)!;
    try {
      const decrypted = await decrypt(value, password, salt);
      newDbList.push(JSON.parse(decrypted));
    } catch (err) {
      continue;
    }
  }
  newDbList.sort((a, b) => a.createdAt - b.createdAt);
  commit('setDbList', newDbList);
}

async function loadProfiles({ commit }: ActionContext<DatabaseModuleState, RootState>) {
  commit('setLoadingProfiles', true);
  try {
    const profiles = await listProfiles();
    const lastProfile = localStorage.getItem('__last_profile');
    commit('setProfiles', profiles);
    commit(
      'setSelectedProfile',
      profiles.some((profile) => profile.name === lastProfile)
        ? lastProfile
        : (profiles[0] && profiles[0].name) || '',
    );
  } catch (err) {
    commit('setProfiles', []);
    commit('showResponse', err, { root: true });
  }
  commit('setLoadingProfiles', false);
}

function submitRemoteForm({
  dispatch,
  commit,
}: ActionContext<DatabaseModuleState, RootState>) {
  commit('correctInputs', 'remote');
  return dispatch('setCredentials');
}

function submitLocalForm({
  dispatch,
  commit,
}: ActionContext<DatabaseModuleState, RootState>) {
  commit('correctInputs', 'local');
  return dispatch('setCredentials');
}

async function fillEditForm(
  { commit, rootState }: ActionContext<DatabaseModuleState, RootState>,
  name: string,
) {
  const { password, salt } = getMasterPassword(rootState);
  const raw = localStorage.getItem(`${name}-db`);
  if (!raw) { return; }
  try {
    const decrypted = await decrypt(raw, password, salt);
    const database = JSON.parse(decrypted);
    commit('fillEditFormFromData', database);
  } catch (err) {
    commit('showResponse', { message: 'Failed to decrypt database entry.' }, { root: true });
  }
}

const actions: ActionTree<DatabaseModuleState, RootState> = {
  removeDbFromStorage,
  setCredentials,
  submitRemoteForm,
  submitLocalForm,
  getDbList,
  loadProfiles,
  fillEditForm,
};

export default actions;
