export interface DatabaseModuleState {
  list: Array<{
    name: string;
    region: string;
  }>;
  selectedProfile: string;
  loadingProfiles: boolean;
}
