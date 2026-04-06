import { db } from "@/lib/firebase";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";

interface PaymentDocData {
  status?: string;
  transactionReference?: string;
  registrationId?: string;
  paymentFlow?: string;
  registrationDraft?: Record<string, unknown>;
  workshopRegistrationDraft?: Record<string, unknown>;
  studentData?: Record<string, unknown>;
  parentData?: Record<string, unknown>;
  addressData?: Record<string, unknown>;
  course?: { key?: string; name?: string; price?: number };
  workshop?: { key?: string; name?: string; fee?: number };
  paymentType?: string;
  amount?: number;
}

export async function finalizeRegistrationForPayment(
  orderId: string,
  txnId?: string
): Promise<{ ok: boolean; registrationId?: string; reason?: string }> {
  const paymentsRef = collection(db, "payments");
  const paymentQuery = query(paymentsRef, where("orderId", "==", orderId));
  const paymentSnapshot = await getDocs(paymentQuery);

  if (paymentSnapshot.empty) {
    return { ok: false, reason: "Payment record not found" };
  }

  const paymentDoc = paymentSnapshot.docs[0];
  const payment = paymentDoc.data() as PaymentDocData;

  if (payment.status !== "SUCCESS" && payment.status !== "CHARGED") {
    return { ok: false, reason: "Payment not successful" };
  }

  if (payment.registrationId) {
    return { ok: true, registrationId: payment.registrationId };
  }

  if (payment.paymentFlow === "workshop") {
    const workshopDraft = (payment.workshopRegistrationDraft || {}) as Record<
      string,
      any
    >;
    const workshop = (payment.workshop || {}) as Record<string, any>;

    const workshopRegistrationsRef = collection(db, "workshopRegistrations");
    const existingWorkshopQuery = query(
      workshopRegistrationsRef,
      where("orderId", "==", orderId),
    );
    const existingWorkshopSnapshot = await getDocs(existingWorkshopQuery);

    if (!existingWorkshopSnapshot.empty) {
      const existingWorkshopDoc = existingWorkshopSnapshot.docs[0];
      const existingId = existingWorkshopDoc.id;

      await updateDoc(doc(db, "workshopRegistrations", existingId), {
        childName: workshopDraft.childName ?? "",
        email: workshopDraft.email ?? "",
        contactNumber: workshopDraft.contactNumber ?? "",
        age: workshopDraft.age ?? "",
        city: workshopDraft.city ?? "",
        area: workshopDraft.area ?? "",
        workshopKey: workshop.key ?? "",
        workshopName: workshop.name ?? "",
        workshopFee: workshop.fee ?? payment.amount ?? null,
        paymentType: payment.paymentType ?? "full",
        paidAmount: payment.amount ?? workshop.fee ?? null,
        paymentStatus: payment.status ?? "SUCCESS",
        status: "confirmed",
        paymentId: payment.transactionReference || txnId || "",
        updatedAt: serverTimestamp(),
      });

      await updateDoc(doc(db, "payments", paymentDoc.id), {
        registrationId: existingId,
        registrationCreatedAt: serverTimestamp(),
      });
      return { ok: true, registrationId: existingId };
    }

    const workshopRegistrationPayload = {
      childName: workshopDraft.childName ?? "",
      email: workshopDraft.email ?? "",
      contactNumber: workshopDraft.contactNumber ?? "",
      age: workshopDraft.age ?? "",
      city: workshopDraft.city ?? "",
      area: workshopDraft.area ?? "",
      workshopKey: workshop.key ?? "",
      workshopName: workshop.name ?? "",
      workshopFee: workshop.fee ?? payment.amount ?? null,
      paymentType: payment.paymentType ?? "full",
      paidAmount: payment.amount ?? workshop.fee ?? null,
      paymentStatus: payment.status ?? "SUCCESS",
      status: "confirmed",
      orderId,
      paymentId: payment.transactionReference || txnId || "",
      dateOfRegistration: new Date().toISOString().split("T")[0],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const workshopDocRef = await addDoc(
      workshopRegistrationsRef,
      workshopRegistrationPayload,
    );

    await updateDoc(doc(db, "payments", paymentDoc.id), {
      registrationId: workshopDocRef.id,
      studentName: workshopDraft.childName ?? "",
      currentAge: workshopDraft.age ?? "",
      courseName: workshop.name ?? "",
      courseKey: workshop.key ?? "",
      parentEmail: workshopDraft.email ?? "",
      primaryParentEmail: workshopDraft.email ?? "",
      parentPhone: workshopDraft.contactNumber ?? "",
      primaryParentContact: workshopDraft.contactNumber ?? "",
      registrationCreatedAt: serverTimestamp(),
    });

    return { ok: true, registrationId: workshopDocRef.id };
  }

  const registrationsRef = collection(db, "registrations");
  const existingRegQuery = query(registrationsRef, where("orderId", "==", orderId));
  const existingRegSnapshot = await getDocs(existingRegQuery);

  if (!existingRegSnapshot.empty) {
    const existingId = existingRegSnapshot.docs[0].id;
    await updateDoc(doc(db, "payments", paymentDoc.id), {
      registrationId: existingId,
      registrationCreatedAt: serverTimestamp(),
    });
    return { ok: true, registrationId: existingId };
  }

  const draft = (payment.registrationDraft || {}) as Record<string, any>;
  const student = (payment.studentData || {}) as Record<string, any>;
  const parent = (payment.parentData || {}) as Record<string, any>;
  const address = (payment.addressData || {}) as Record<string, any>;
  const course = (payment.course || {}) as Record<string, any>;

  const registrationPayload = {
    studentName: draft.studentName ?? student.studentName ?? "",
    dateOfBirth: draft.dateOfBirth ?? student.dateOfBirth ?? "",
    currentAge: draft.currentAge ?? student.currentAge ?? "",
    schoolName: draft.schoolName ?? student.schoolName ?? "",
    class: draft.class ?? student.class ?? "",
    board: draft.board ?? student.board ?? "",
    primaryParentType: draft.primaryParentType ?? parent.primaryParentType ?? "",
    primaryParentName: draft.primaryParentName ?? parent.primaryParentName ?? "",
    primaryParentContact:
      draft.primaryParentContact ?? parent.primaryParentContact ?? "",
    primaryParentEmail: draft.primaryParentEmail ?? parent.primaryParentEmail ?? "",
    currentAddress: draft.currentAddress ?? address.currentAddress ?? "",
    permanentAddress: draft.permanentAddress ?? address.permanentAddress ?? "",
    selectedCourseKey: draft.selectedCourseKey ?? course.key ?? "",
    selectedCourseName: draft.selectedCourseName ?? course.name ?? "",
    selectedCourseFee: draft.selectedCourseFee ?? course.price ?? null,
    paymentType: draft.paymentType ?? payment.paymentType ?? "full",
    paidAmount: draft.paidAmount ?? payment.amount ?? null,
    paymentRemark: draft.paymentRemark ?? "",
    orderId,
    paymentId: payment.transactionReference || txnId || "",
    dateOfRegistration: new Date().toISOString().split("T")[0],
    createdAt: serverTimestamp(),
  };

  const regDocRef = await addDoc(registrationsRef, registrationPayload);

  await updateDoc(doc(db, "payments", paymentDoc.id), {
    registrationId: regDocRef.id,
    studentName: registrationPayload.studentName,
    courseName: registrationPayload.selectedCourseName,
    courseKey: registrationPayload.selectedCourseKey,
    parentEmail: registrationPayload.primaryParentEmail,
    parentPhone: registrationPayload.primaryParentContact,
    registrationCreatedAt: serverTimestamp(),
  });

  return { ok: true, registrationId: regDocRef.id };
}
