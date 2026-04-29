import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type {
  Direction,
  KeyPairType,
  SessionRecordType,
  StorageType,
} from "@privacyresearch/libsignal-protocol-typescript";

const DB_NAME = "e2e-db";
const STORE_NAME = "e2e-store" as const;

type KeyMaterial = KeyPairType<ArrayBuffer>;
type PreKeyStoreKey = `preKey:${string | number}`;
type SignedPreKeyStoreKey = `signedPreKey:${string | number}`;
type SessionStoreKey = `session:${string}`;
type IdentityStoreKey = `identity:${string}`;

type StoreSchema = {
  identityKey: KeyMaterial;
  registrationId: number;
} & {
  [K in PreKeyStoreKey]: KeyMaterial;
} & {
  [K in SignedPreKeyStoreKey]: KeyMaterial;
} & {
  [K in SessionStoreKey]: SessionRecordType;
} & {
  [K in IdentityStoreKey]: ArrayBuffer;
};

type StoreKey = keyof StoreSchema & string;
type StoreValue = StoreSchema[StoreKey];

interface SignalDatabase extends DBSchema {
  [STORE_NAME]: {
    key: StoreKey;
    value: StoreValue;
  };
}

const getPreKeyStoreKey = (keyId: string | number): PreKeyStoreKey =>
  `preKey:${keyId}`;

const getSignedPreKeyStoreKey = (
  keyId: string | number
): SignedPreKeyStoreKey => `signedPreKey:${keyId}`;

const getSessionStoreKey = (identifier: string): SessionStoreKey =>
  `session:${identifier}`;

const normalizeIdentityIdentifier = (identifier: string): string =>
  identifier.split(".")[0] ?? identifier;

const getIdentityStoreKey = (identifier: string): IdentityStoreKey =>
  `identity:${normalizeIdentityIdentifier(identifier)}`;

const areArrayBuffersEqual = (left: ArrayBuffer, right: ArrayBuffer): boolean => {
  if (left.byteLength !== right.byteLength) {
    return false;
  }

  const leftView = new Uint8Array(left);
  const rightView = new Uint8Array(right);

  for (let index = 0; index < leftView.length; index += 1) {
    if (leftView[index] !== rightView[index]) {
      return false;
    }
  }

  return true;
};

export class SignalProtocolStore implements StorageType {
  private db: Promise<IDBPDatabase<SignalDatabase>>;

  constructor() {
    this.db = openDB<SignalDatabase>(DB_NAME, 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      },
    });
  }

  // GENERIC
  private async get<K extends StoreKey>(
    key: K
  ): Promise<StoreSchema[K] | undefined> {
    const value = await (await this.db).get(STORE_NAME, key);
    return value as StoreSchema[K] | undefined;
  }

  private async put<K extends StoreKey>(
    key: K,
    value: StoreSchema[K]
  ): Promise<void> {
    await (await this.db).put(STORE_NAME, value, key);
  }

  private async remove<K extends StoreKey>(key: K): Promise<void> {
    await (await this.db).delete(STORE_NAME, key);
  }

  // IDENTITY
  async getIdentityKeyPair(): Promise<KeyMaterial | undefined> {
    return this.get("identityKey");
  }

  async getLocalRegistrationId(): Promise<number | undefined> {
    return this.get("registrationId");
  }

  async putIdentityKeyPair(keyPair: KeyMaterial): Promise<void> {
    await this.put("identityKey", keyPair);
  }

  async putRegistrationId(id: number): Promise<void> {
    await this.put("registrationId", id);
  }

  // PRE KEYS
  async storePreKey(keyId: number | string, keyPair: KeyMaterial): Promise<void> {
    await this.put(getPreKeyStoreKey(keyId), keyPair);
  }

  async loadPreKey(keyId: number | string): Promise<KeyMaterial | undefined> {
    return this.get(getPreKeyStoreKey(keyId));
  }

  async removePreKey(keyId: number | string): Promise<void> {
    await this.remove(getPreKeyStoreKey(keyId));
  }

  // SIGNED PRE KEY
  async storeSignedPreKey(
    keyId: number | string,
    keyPair: KeyMaterial
  ): Promise<void> {
    await this.put(getSignedPreKeyStoreKey(keyId), keyPair);
  }

  async loadSignedPreKey(
    keyId: number | string
  ): Promise<KeyMaterial | undefined> {
    return this.get(getSignedPreKeyStoreKey(keyId));
  }

  async removeSignedPreKey(keyId: number | string): Promise<void> {
    await this.remove(getSignedPreKeyStoreKey(keyId));
  }

  // SESSION

  async storeSession(
    identifier: string,
    record: SessionRecordType
  ): Promise<void> {
    await this.put(getSessionStoreKey(identifier), record);
  }

  async loadSession(identifier: string): Promise<SessionRecordType | undefined> {
    return this.get(getSessionStoreKey(identifier));
  }

  async removeSession(identifier: string): Promise<void> {
    await this.remove(getSessionStoreKey(identifier));
  }

  // TRUST
  async isTrustedIdentity(
    identifier: string,
    identityKey: ArrayBuffer,
    //eslint-disable-next-line
    _direction: Direction
  ): Promise<boolean> {
    const trusted = await this.get(getIdentityStoreKey(identifier));

    if (!trusted) {
      return true;
    }

    return areArrayBuffersEqual(trusted, identityKey);
  }

  async saveIdentity(
    identifier: string,
    identityKey: ArrayBuffer,
    //eslint-disable-next-line
    _nonblockingApproval?: boolean
  ): Promise<boolean> {
    const key = getIdentityStoreKey(identifier);
    const existingIdentity = await this.get(key);
    const hasChanged =
      !existingIdentity || !areArrayBuffersEqual(existingIdentity, identityKey);

    if (hasChanged) {
      await this.put(key, identityKey);
    }

    return hasChanged;
  }
}
