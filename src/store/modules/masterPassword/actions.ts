import { ActionTree, ActionContext } from 'vuex';
import { MasterPasswordState } from './types';
import { RootState } from '@/store/types';
import {
  generateSalt,
  saveSalt,
  loadSalt,
  savePasswordCheck,
  verifyPassword,
  isMasterPasswordConfigured,
  MP_SALT_KEY,
  MP_CHECK_KEY,
  encrypt,
  decrypt,
} from '@/utils/crypto';

async function setupMasterPassword(
  { commit }: ActionContext<MasterPasswordState, RootState>,
  password: string,
) {
  const salt = generateSalt();
  saveSalt(salt);
  await savePasswordCheck(password, salt);

  // Encrypt any existing plaintext DB entries
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)!;
    if (!key.endsWith('-db')) { continue; }
    const value = localStorage.getItem(key)!;
    try {
      JSON.parse(value);
    } catch {
      continue;
    }
    const encrypted = await encrypt(value, password, salt);
    localStorage.setItem(key, encrypted);
  }

  commit('setSalt', salt);
  commit('setPassword', password);
  commit('setConfigured', true);
  commit('unlock');
}

async function unlockWithPassword(
  { commit }: ActionContext<MasterPasswordState, RootState>,
  password: string,
): Promise<boolean> {
  const salt = loadSalt();
  if (!salt) { return false; }
  const valid = await verifyPassword(password, salt);
  if (!valid) { return false; }
  commit('setSalt', salt);
  commit('setPassword', password);
  commit('unlock');
  return true;
}

function forgotPassword(
  { commit }: ActionContext<MasterPasswordState, RootState>,
) {
  // Wipe all encrypted DB entries and master password metadata
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)!;
    if (key.endsWith('-db') || key === MP_SALT_KEY || key === MP_CHECK_KEY) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach((key) => localStorage.removeItem(key));

  commit('setConfigured', false);
  commit('lock');
  commit('setPassword', '');
  commit('setSalt', null);
}

const actions: ActionTree<MasterPasswordState, RootState> = {
  setupMasterPassword,
  unlockWithPassword,
  forgotPassword,
};

export default actions;
