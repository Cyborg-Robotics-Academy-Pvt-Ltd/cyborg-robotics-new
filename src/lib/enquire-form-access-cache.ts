import { adminDb } from "@/lib/firebase-admin";

const ACCESS_DOCUMENT = "appSettings/enquireFormAccess";
const ACCESS_CACHE_TTL_MS = 60_000;

export type EnquireFormAccess = {
  selectedTrainerId: string | null;
};

let cachedAccess: {
  value: EnquireFormAccess;
  expiresAt: number;
} | null = null;
let accessRequest: Promise<EnquireFormAccess> | null = null;
let cacheGeneration = 0;

export function invalidateEnquireFormAccessCache() {
  cacheGeneration += 1;
  cachedAccess = null;
  accessRequest = null;
}

export async function getEnquireFormAccess(): Promise<EnquireFormAccess> {
  if (cachedAccess && cachedAccess.expiresAt > Date.now()) {
    return cachedAccess.value;
  }

  if (accessRequest) return accessRequest;

  const requestGeneration = cacheGeneration;
  const request = (async () => {
    try {
      const snapshot = await adminDb.doc(ACCESS_DOCUMENT).get();
      const selectedTrainerId = snapshot.data()?.selectedTrainerId;
      const value = {
        selectedTrainerId:
          typeof selectedTrainerId === "string" ? selectedTrainerId : null,
      };
      if (cacheGeneration === requestGeneration) {
        cachedAccess = {
          value,
          expiresAt: Date.now() + ACCESS_CACHE_TTL_MS,
        };
      }
      return value;
    } catch (error) {
      if (cachedAccess) {
        cachedAccess.expiresAt = Date.now() + ACCESS_CACHE_TTL_MS;
        return cachedAccess.value;
      }
      throw error;
    }
  })();

  accessRequest = request;
  try {
    return await request;
  } finally {
    if (accessRequest === request) accessRequest = null;
  }
}
