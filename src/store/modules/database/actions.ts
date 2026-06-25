import { ActionTree, ActionContext } from 'vuex';
import { DatabaseModuleState } from './types';
import { RootState } from '@/store/types';
import { listProfiles } from '@/utils/desktop';

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

const actions: ActionTree<DatabaseModuleState, RootState> = {
  loadProfiles,
};

export default actions;
