import { NextResponse } from "next/server";
import {
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { serverClientAuth, serverClientDb } from "@/lib/firebase-server-client";

const REGISTRATION_COLLECTIONS: Record<string, string> = {
  new: "registrations",
  renewal: "renewals",
  workshop: "workshopRegistrations",
  competition: "competitionRegistrations",
  other: "otherRegistrations",
};

const CENTER_PREFIXES = {
  "KALYANI NAGAR": "KN",
  "VIMAN NAGAR": "VN",
  MAGARPATTA: "MG",
  KHARADI: "KH",
} as const;

type CenterLocation = keyof typeof CENTER_PREFIXES;

function normalizeCenterLocation(center: string): CenterLocation {
  const normalized = center.trim().toUpperCase();
  if (normalized.includes("VIMAN") || normalized.includes("VN")) {
    return "VIMAN NAGAR";
  }
  if (normalized.includes("MAGARPATTA") || normalized.includes("MG")) {
    return "MAGARPATTA";
  }
  if (normalized.includes("KHARADI") || normalized.includes("KH")) {
    return "KHARADI";
  }
  return "KALYANI NAGAR";
}

function normalizeEmail(value: unknown) {
  return String(value || "").trim().toLowerCase();
}


async function assertAdmin(adminUid: string) {
  if (!adminUid) return false;
  const [adminById, adminByUid] = await Promise.all([
    getDoc(doc(serverClientDb, "admins", adminUid)),
    getDocs(
      query(
        collection(serverClientDb, "admins"),
        where("uid", "==", adminUid),
      ),
    ),
  ]);
  return adminById.exists() || !adminByUid.empty;
}

async function emailExistsInProfiles(email: string) {
  for (const collectionName of ["students", "trainers", "admins"]) {
    const snapshot = await getDocs(
      query(
        collection(serverClientDb, collectionName),
        where("email", "==", email),
      ),
    );
    if (!snapshot.empty) return true;
  }
  return false;
}

async function generatePrnNumberForServerClient(center: CenterLocation) {
  const prefix = CENTER_PREFIXES[center];
  const studentsSnapshot = await getDocs(collection(serverClientDb, "students"));
  let maxNumber = 1000;

  studentsSnapshot.forEach((studentDoc) => {
    const prn = studentDoc.data().PrnNumber;
    if (typeof prn !== "string" || !prn.startsWith(`CRA${prefix}`)) return;

    const number = Number.parseInt(prn.replace(`CRA${prefix}`, ""), 10);
    if (!Number.isNaN(number) && number > maxNumber) {
      maxNumber = number;
    }
  });

  return `CRA${prefix}${String(maxNumber + 1).padStart(4, "0")}`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const adminUid = String(body?.adminUid || "").trim();
    const registration = body?.registration || {};
    const selectedCenter = String(body?.center || "").trim();
    const selectedCourse = String(body?.course || "").trim();

    if (!(await assertAdmin(adminUid))) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: admin privileges required" },
        { status: 403 },
      );
    }

    if (!selectedCenter || !selectedCourse) {
      return NextResponse.json(
        { success: false, message: "Center and course are required" },
        { status: 400 },
      );
    }

    const paymentStatus = String(registration.paymentStatus || "").toUpperCase();
    if (paymentStatus !== "SUCCESS" && paymentStatus !== "CASH_PAY") {
      return NextResponse.json(
        { success: false, message: "Payment must be successful first" },
        { status: 400 },
      );
    }

    const email = normalizeEmail(registration.email);
    const fullName = String(registration.name || "").trim();
    if (!email || !fullName) {
      return NextResponse.json(
        { success: false, message: "Registration name and email are required" },
        { status: 400 },
      );
    }

    if (await emailExistsInProfiles(email)) {
      return NextResponse.json(
        { success: false, message: `A user with ${email} already exists` },
        { status: 409 },
      );
    }

    const centerLocation = normalizeCenterLocation(selectedCenter);
    const prnNumber = await generatePrnNumberForServerClient(centerLocation);
    // const temporaryPassword = makeTemporaryPassword();
    const temporaryPassword = "Pass@123456";

    const userCredential = await createUserWithEmailAndPassword(
      serverClientAuth,
      email,
      temporaryPassword,
    );
    const user = userCredential.user;
    await updateProfile(user, {
      displayName: fullName,
    });

    const courseRecord = {
      name: selectedCourse,
      level: "1",
      classNumber: "",
      status: "ongoing",
      enrolledAt: new Date(),
    };

    const studentPayload = {
      uid: user.uid,
      email,
      fullName,
      username: fullName,
      role: "student",
      status: "active",
      emailVerified: true,
      PrnNumber: prnNumber,
      center: centerLocation,
      location: centerLocation,
      courses: [courseRecord],
      parentName: registration.parentName || "",
      parentEmail: email,
      contact: registration.contact || "",
      schoolName: registration.schoolName || "",
      className: registration.className || "",
      sourceRegistrationId: registration.firestoreId || "",
      sourcePaymentDocId: registration.paymentDocId || "",
      orderId: registration.orderId || "",
      createdByAdminUid: adminUid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(doc(serverClientDb, "students", user.uid), studentPayload);

    const registrationType = String(registration.registrationType || "new");
    const collectionName =
      REGISTRATION_COLLECTIONS[registrationType] || REGISTRATION_COLLECTIONS.new;
    const registrationUpdate = {
      studentUid: user.uid,
      studentPRN: prnNumber,
      PrnNumber: prnNumber,
      center: centerLocation,
      location: centerLocation,
      selectedCourseName: selectedCourse,
      courseName: selectedCourse,
      registrationAccountCreated: true,
      registrationAccountCreatedAt: serverTimestamp(),
      status: "confirmed",
      paymentStatus,
      updatedAt: serverTimestamp(),
    };

    if (registration.firestoreId) {
      await setDoc(
        doc(serverClientDb, collectionName, String(registration.firestoreId)),
        registrationUpdate,
        { merge: true },
      );
    }

    if (registration.paymentDocId) {
      await setDoc(
        doc(serverClientDb, "payments", String(registration.paymentDocId)),
        {
          ...registrationUpdate,
          registrationCreatedAt: serverTimestamp(),
        },
        { merge: true },
      );
    } else if (registration.orderId) {
      const paymentsSnapshot = await getDocs(
        query(
          collection(serverClientDb, "payments"),
          where("orderId", "==", String(registration.orderId)),
        ),
      );
      const batch = writeBatch(serverClientDb);
      paymentsSnapshot.forEach((paymentDoc) => {
        batch.set(
          paymentDoc.ref,
          {
            ...registrationUpdate,
            registrationCreatedAt: serverTimestamp(),
          },
          { merge: true },
        );
      });
      if (!paymentsSnapshot.empty) {
        await batch.commit();
      }
    }

    return NextResponse.json({
      success: true,
      uid: user.uid,
      prnNumber,
      temporaryPassword,
      message: "Student account and registration created successfully",
    });
  } catch (error: any) {
    console.error("Failed to create student registration:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error?.code === "auth/email-already-in-use"
            ? "A Firebase Auth user with this email already exists"
            : error?.message || "Failed to create student registration",
      },
      { status: 500 },
    );
  } finally {
    if (serverClientAuth.currentUser) {
      await signOut(serverClientAuth).catch((signOutError) => {
        console.error("Failed to clear server user creation auth:", signOutError);
      });
    }
  }
}
