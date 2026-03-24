import { GetterTree } from 'vuex';
import { MasterPasswordState } from './types';
import { RootState } from '@/store/types';

const getters: GetterTree<MasterPasswordState, RootState> = {
  isLocked: (state) => state.isLocked,
  isConfigured: (state) => state.isConfigured,
  masterPassword: (state) => state.password,
  masterSalt: (state) => state.salt,
};

export default getters;
