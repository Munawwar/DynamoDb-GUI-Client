import { MutationTree } from 'vuex';
import { MasterPasswordState } from './types';

const mutations: MutationTree<MasterPasswordState> = {
  unlock(state) {
    state.isLocked = false;
  },
  lock(state) {
    state.isLocked = true;
    state.password = '';
    state.salt = null;
  },
  setConfigured(state, configured: boolean) {
    state.isConfigured = configured;
  },
  setPassword(state, password: string) {
    state.password = password;
  },
  setSalt(state, salt: ArrayBuffer) {
    state.salt = salt;
  },
};

export default mutations;
