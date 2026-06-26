import { AwsConnection, AwsProfile } from './utils/desktop';

declare global {
  interface Window {
    electronAPI?: {
      listProfiles: () => Promise<AwsProfile[]>;
      resolveProfile: (name: string) => Promise<AwsConnection>;
      getLoginCommand: (name: string) => Promise<string>;
    };
  }
}

export {};
