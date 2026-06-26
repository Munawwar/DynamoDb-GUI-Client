import { MasterPasswordState } from './types';
import { isMasterPasswordConfigured } from '@/utils/crypto';

const state: MasterPasswordState = {
  isLocked: true,
  isConfigured: isMasterPasswordConfigured(),
  password: '',
  salt: null,
};

export default state;
