jest.mock('aws-sdk/clients/dynamodb', () => {
  const DynamoDB = jest.fn().mockImplementation(() => ({
    listTables: jest.fn().mockReturnValue({ promise: jest.fn().mockResolvedValue({ TableNames: [] }) }),
  }));
  (DynamoDB as any).DocumentClient = jest.fn();
  return DynamoDB;
});

jest.mock('@/utils/crypto', () => ({
  MP_CHECK_KEY: '__mp_check',
  MP_SALT_KEY: '__mp_salt',
  decrypt: jest.fn((value) => Promise.resolve(String(value).replace(/^encrypted:/, ''))),
  encrypt: jest.fn((value) => Promise.resolve(`encrypted:${value}`)),
  generateSalt: jest.fn(() => new ArrayBuffer(8)),
  isMasterPasswordConfigured: jest.fn(() => true),
  loadSalt: jest.fn(() => new ArrayBuffer(8)),
  savePasswordCheck: jest.fn(() => Promise.resolve()),
  saveSalt: jest.fn(),
  verifyPassword: jest.fn(() => Promise.resolve(true)),
}));

import storeConfig from '@/store';
import database from '@/store/modules/database';
import {
  fakeSubmitForm,
  emptySubmitForm,
  duplicateDbName,
  wrongSubmitForm,
} from './testData';

const store = storeConfig;

function clone(form: typeof fakeSubmitForm) {
  return JSON.parse(JSON.stringify(form));
}

beforeEach(() => {
  localStorage.clear();
  store.commit('initialState');
  store.commit('database/setDbList', []);
  store.commit('database/setToDefault');
});

test('Database submitted with missing field', async () => {
  database.state.submitForm = clone(emptySubmitForm);
  await store.dispatch('database/setCredentials');
  expect(database.state.list.length).toBe(0);
});

test('Database submitted with missing field', async () => {
  database.state.submitForm = clone(wrongSubmitForm);
  const response = await store.dispatch('database/setCredentials');
  expect(response).toBeUndefined();
});

test('Database added successfully', async () => {
  database.state.submitForm = clone(fakeSubmitForm);
  await store.dispatch('database/setCredentials');
  expect(database.state.list.length).toBe(1);
  database.state.submitForm = clone(duplicateDbName);
  await store.dispatch('database/setCredentials');
  expect(store.state.response.message).toBe(
    'Database with that name already exists',
  );
});

test('Session token is optional', async () => {
  const form = clone(fakeSubmitForm);
  (form.configs as any).sessionToken = '';
  database.state.submitForm = form;
  await store.dispatch('database/setCredentials');
  expect(database.state.list.length).toBe(1);
});
