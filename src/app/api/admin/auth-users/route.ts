import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

export async function GET(request: Request) {
  const authorization = request.headers.get("authorization");
  const token = authorization?.startsWith("Bearer ")
    ? authorization.slice(7)
    : null;

  if (!token) {
    return NextResponse.json({ error: "Missing auth token" }, { status: 401 });
  }

  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    const adminProfile = await adminDb
      .collection("admins")
      .doc(decodedToken.uid)
      .get();

    if (!adminProfile.exists) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const users = [];
    let pageToken: string | undefined;

    do {
      const page = await adminAuth.listUsers(1000, pageToken);
      users.push(
        ...page.users.map((authUser) => ({
          id: authUser.uid,
          name: authUser.displayName || "",
          email: authUser.email || "",
          disabled: authUser.disabled,
          createdAt: authUser.metadata.creationTime,
        })),
      );
      pageToken = page.pageToken;
    } while (pageToken);

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Error listing Firebase Authentication users:", error);
    return NextResponse.json(
      { error: "Unable to load authentication users" },
      { status: 500 },
    );
  }
}
