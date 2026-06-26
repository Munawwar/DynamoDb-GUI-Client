export interface MasterPasswordState {
  isLocked: boolean;
  isConfigured: boolean;
  password: string;
  salt: ArrayBuffer | null;
}
