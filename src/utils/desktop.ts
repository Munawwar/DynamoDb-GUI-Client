export interface AwsProfile {
  name: string;
  region: string;
}

export interface AwsConnection extends AwsProfile {
  accessKeyId: string;
  secretAccessKey: string;
  sessionToken?: string;
  expiration?: string;
}

function getDesktopApi() {
  if (window.electronAPI) {
    return window.electronAPI;
  }
  throw new Error(
    'Desktop features are unavailable. Launch the Electron app instead of the browser build.',
  );
}

export async function listProfiles(): Promise<AwsProfile[]> {
  const profiles = await getDesktopApi().listProfiles();
  return profiles.sort((left, right) => left.name.localeCompare(right.name));
}

export function resolveProfile(name: string): Promise<AwsConnection> {
  return getDesktopApi().resolveProfile(name);
}

export function formatLoginCommand(name: string) {
  return `aws sso login --profile ${name}`;
}
