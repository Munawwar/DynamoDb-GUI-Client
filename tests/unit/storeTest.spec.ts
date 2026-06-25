import store from '@/store';

const profiles = [
  { name: 'dev-write', region: 'eu-west-1' },
  { name: 'prod-read', region: 'eu-west-1' },
];

const connection = {
  name: 'dev-write',
  region: 'eu-west-1',
  accessKeyId: 'test-key',
  secretAccessKey: 'test-secret',
  sessionToken: 'test-token',
  expiration: '2099-01-01T00:00:00Z',
};

function resetStore() {
  localStorage.clear();
  store.commit('initialState');
  store.commit('database/setProfiles', []);
  store.commit('database/setSelectedProfile', '');
}

beforeEach(() => {
  resetStore();
  window.electronAPI = {
    listProfiles: jest.fn().mockResolvedValue(profiles),
    resolveProfile: jest.fn().mockResolvedValue(connection),
  };
});

test('profile list loads and restores the last selection', async () => {
  localStorage.setItem('__last_profile', 'prod-read');
  await store.dispatch('database/loadProfiles');
  expect((store.state as any).database.list).toEqual(profiles);
  expect((store.state as any).database.selectedProfile).toBe('prod-read');
});

test('connecting a profile updates the active dynamodb session', async () => {
  await store.dispatch('getCurrentDb', 'dev-write');
  expect(store.getters.currentDb).toBe('dev-write');
  expect(store.getters.currentRegion).toBe('eu-west-1');
  expect(localStorage.getItem('__last_profile')).toBe('dev-write');
});
