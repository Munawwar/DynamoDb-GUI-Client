import { Module } from 'vuex';
import { MasterPasswordState } from './types';
import { RootState } from '@/store/types';
import state from './state';
import mutations from './mutations';
import actions from './actions';
import getters from './getters';

const masterPassword: Module<MasterPasswordState, RootState> = {
  namespaced: true,
  state,
  mutations,
  actions,
  getters,
};

export default masterPassword;
