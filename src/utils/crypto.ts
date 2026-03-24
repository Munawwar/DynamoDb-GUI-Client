const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;
const PBKDF2_ITERATIONS = 100000;
const SALT_LENGTH = 16;
const IV_LENGTH = 12;
const CHECK_PLAINTEXT = 'master-password-ok';

// localStorage keys for master password metadata
export const MP_SALT_KEY = '__mp_salt';
export const MP_CHECK_KEY = '__mp_check';

function bufferToBase64(buffer: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}

function base64ToBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

async function deriveKey(password: string, salt: ArrayBuffer): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveKey'],
  );
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    keyMaterial,
    { name: ALGORITHM, length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt'],
  );
}

export async function encrypt(plaintext: string, password: string, salt: ArrayBuffer): Promise<string> {
  const key = await deriveKey(password, salt);
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const encoded = new TextEncoder().encode(plaintext);
  const ciphertext = await crypto.subtle.encrypt({ name: ALGORITHM, iv }, key, encoded);
  // Store as "iv:ciphertext" both base64-encoded
  return bufferToBase64(iv.buffer) + ':' + bufferToBase64(ciphertext);
}

export async function decrypt(stored: string, password: string, salt: ArrayBuffer): Promise<string> {
  const [ivB64, ciphertextB64] = stored.split(':');
  const iv = new Uint8Array(base64ToBuffer(ivB64));
  const ciphertext = base64ToBuffer(ciphertextB64);
  const key = await deriveKey(password, salt);
  const decrypted = await crypto.subtle.decrypt({ name: ALGORITHM, iv }, key, ciphertext);
  return new TextDecoder().decode(decrypted);
}

export function generateSalt(): ArrayBuffer {
  return crypto.getRandomValues(new Uint8Array(SALT_LENGTH)).buffer;
}

export function saveSalt(salt: ArrayBuffer): void {
  localStorage.setItem(MP_SALT_KEY, bufferToBase64(salt));
}

export function loadSalt(): ArrayBuffer | null {
  const b64 = localStorage.getItem(MP_SALT_KEY);
  if (!b64) { return null; }
  return base64ToBuffer(b64);
}

/** Encrypt a known string and store it so we can verify the password later. */
export async function savePasswordCheck(password: string, salt: ArrayBuffer): Promise<void> {
  const encrypted = await encrypt(CHECK_PLAINTEXT, password, salt);
  localStorage.setItem(MP_CHECK_KEY, encrypted);
}

/** Returns true if the password correctly decrypts the check value. */
export async function verifyPassword(password: string, salt: ArrayBuffer): Promise<boolean> {
  const stored = localStorage.getItem(MP_CHECK_KEY);
  if (!stored) { return false; }
  try {
    const result = await decrypt(stored, password, salt);
    return result === CHECK_PLAINTEXT;
  } catch {
    return false;
  }
}

/** Returns true if a master password has been configured. */
export function isMasterPasswordConfigured(): boolean {
  return localStorage.getItem(MP_SALT_KEY) !== null && localStorage.getItem(MP_CHECK_KEY) !== null;
}
