export interface SingleDatabaseModuleState {
  name: string;
  accessKeyId: string;
  secretAccessKey: string;
  sessionToken?: string;
  region: string;
  maxRetries: number;
}

export interface DatabaseModuleState {
  list: SingleDatabaseModuleState[];
  submitForm: SubmitForm;
  regionList: string[];
  showEditModal: boolean;
}

export interface SubmitForm {
  configs: DbConfigs;
  name: string;
  color: string;
  createdAt: number;
}

export interface DbConfigs {
  accessKeyId: string;
  secretAccessKey: string;
  sessionToken?: string;
  region: string;
  endpoint: string;
  maxRetries: number;
  dynamoDbCrc32: boolean;
}
