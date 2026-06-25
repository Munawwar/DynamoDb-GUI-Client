import { MutationTree } from 'vuex';
import { DatabaseModuleState } from './types';

function setProfiles(
  state: DatabaseModuleState,
  profiles: Array<{ name: string; region: string }>,
) {
  state.list = profiles;
}

function setSelectedProfile(state: DatabaseModuleState, profile: string) {
  state.selectedProfile = profile;
}

function setLoadingProfiles(state: DatabaseModuleState, loadingProfiles: boolean) {
  state.loadingProfiles = loadingProfiles;
}

const mutations: MutationTree<DatabaseModuleState> = {
  setProfiles,
  setSelectedProfile,
  setLoadingProfiles,
};
export default mutations;
