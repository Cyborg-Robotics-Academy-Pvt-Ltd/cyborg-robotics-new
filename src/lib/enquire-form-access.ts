import { adminAuth, adminDb } from "@/lib/firebase-admin";

export class EnquireFormAccessError extends Error {
  constructor(
    message: "Unauthorized" | "Forbidden",
    readonly status: 401 | 403,
  ) {
    super(message);
  }
}

type Role = "admin" | "trainer" | "sales" | "marketing";

const ROLE_COLLECTIONS: Record<Role, string> = {
  admin: "admins",
  trainer: "trainers",
  sales: "sales",
  marketing: "marketing",
};

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

  const roles: Role[] = ["admin", "trainer", "sales", "marketing"];
  const profiles = await Promise.all(
    roles.map((role) =>
      adminDb.collection(ROLE_COLLECTIONS[role]).doc(decoded.uid).get(),
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

  return { uid: decoded.uid, role: roles[activeRoleIndex] };
}

export async function requireEnquireFormEditor(request: Request) {
  const actor = await getEnquireFormActor(request);
  if (actor.role !== "trainer") return actor;

  const access = await adminDb.doc("appSettings/enquireFormAccess").get();
  if (access.data()?.selectedTrainerId !== actor.uid) {
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
