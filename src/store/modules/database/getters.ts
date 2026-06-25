import { GetterTree } from 'vuex';
import { DatabaseModuleState } from './types';
import { RootState } from '@/store/types';

const selectedProfileDetails = (state: DatabaseModuleState) =>
  state.list.find((profile) => profile.name === state.selectedProfile);

const getters: GetterTree<DatabaseModuleState, RootState> = {
  selectedProfileDetails,
};

export default getters;
