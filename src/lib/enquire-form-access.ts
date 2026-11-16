import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { getEnquireFormAccess } from "@/lib/enquire-form-access-cache";

export class EnquireFormAccessError extends Error {
  constructor(
    message: "Unauthorized" | "Forbidden",
    readonly status: 401 | 403,
  ) {
    super(message);
  }
}

type Role = "admin" | "trainer" | "sales" | "marketing";
const STAFF_ROLES: Role[] = ["admin", "trainer", "sales", "marketing"];

const ROLE_COLLECTIONS: Record<Role, string> = {
  admin: "admins",
  trainer: "trainers",
  sales: "sales",
  marketing: "marketing",
};

const ROLE_CACHE_TTL_MS = 15_000;
const activeRoleCache = new Map<string, { role: Role; expiresAt: number }>();
const activeRoleLookups = new Map<string, Promise<Role>>();

async function getActiveRole(uid: string): Promise<Role> {
  const cached = activeRoleCache.get(uid);
  if (cached && cached.expiresAt > Date.now()) return cached.role;
  activeRoleCache.delete(uid);

  const pendingLookup = activeRoleLookups.get(uid);
  if (pendingLookup) return pendingLookup;

  const lookup = (async () => {
    const profiles = await adminDb.getAll(
      ...STAFF_ROLES.map((role) =>
        adminDb.collection(ROLE_COLLECTIONS[role]).doc(uid),
      ),
    );
    const activeRoleIndex = profiles.findIndex(
      (profile) =>
        profile.exists &&
        !["inactive", "pending"].includes(profile.data()?.status ?? ""),
    );

    if (activeRoleIndex === -1) {
      throw new EnquireFormAccessError("Forbidden", 403);
    }

    const role = STAFF_ROLES[activeRoleIndex];
    activeRoleCache.set(uid, {
      role,
      expiresAt: Date.now() + ROLE_CACHE_TTL_MS,
    });
    return role;
  })();

  activeRoleLookups.set(uid, lookup);
  try {
    return await lookup;
  } finally {
    if (activeRoleLookups.get(uid) === lookup) {
      activeRoleLookups.delete(uid);
    }
  }
}

export async function getEnquireFormActor(request: Request) {
  const authorization = request.headers.get("authorization");
  const token = authorization?.startsWith("Bearer ")
    ? authorization.slice(7)
    : null;

  if (!token) {
    throw new EnquireFormAccessError("Unauthorized", 401);
  }

  let decoded;
  try {
    decoded = await adminAuth.verifyIdToken(token);
  } catch {
    throw new EnquireFormAccessError("Unauthorized", 401);
  }

  if (
    typeof decoded.role === "string" &&
    STAFF_ROLES.includes(decoded.role as Role)
  ) {
    return {
      uid: decoded.uid,
      role: decoded.role as Role,
      roleClaimUpdated: false,
    };
  }

  const role = await getActiveRole(decoded.uid);
  let roleClaimUpdated = false;
  try {
    const authUser = await adminAuth.getUser(decoded.uid);
    if (authUser.customClaims?.role !== role) {
      await adminAuth.setCustomUserClaims(decoded.uid, {
        ...authUser.customClaims,
        role,
      });
      roleClaimUpdated = true;
    }
  } catch (error) {
    // Firestore still authorizes this request; later requests can retry claim setup.
    console.error("Unable to set Enquire form role claim:", decoded.uid, error);
  }

  return { uid: decoded.uid, role, roleClaimUpdated };
}

export async function requireEnquireFormEditor(request: Request) {
  const actor = await getEnquireFormActor(request);
  if (actor.role !== "trainer") return actor;

  const access = await getEnquireFormAccess();
  if (access.selectedTrainerId !== actor.uid) {
    throw new EnquireFormAccessError("Forbidden", 403);
  }

  return actor;
}

export async function requireEnquireFormTrialSlotEditor(request: Request) {
  const actor = await getEnquireFormActor(request);
  if (actor.role !== "admin" && actor.role !== "sales") {
    throw new EnquireFormAccessError("Forbidden", 403);
  }

  return actor;
}

export async function requireEnquireFormAdmin(request: Request) {
  const actor = await getEnquireFormActor(request);
  if (actor.role !== "admin") {
    throw new EnquireFormAccessError("Forbidden", 403);
  }

  return actor;
}
