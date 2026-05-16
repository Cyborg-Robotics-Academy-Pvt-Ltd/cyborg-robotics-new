import { db } from "@/lib/firebase";
import { generateCompetitionHallTicketNumber } from "@/lib/codefest-registration-validation";
import {
  addDoc,
  collection,
  doc,
  getDoc,
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
  competitionRegistrationDraft?: Record<string, unknown>;
  studentData?: Record<string, unknown>;
  parentData?: Record<string, unknown>;
  addressData?: Record<string, unknown>;
  course?: { key?: string; name?: string; price?: number };
  workshop?: { key?: string; name?: string; fee?: number };
  competition?: { key?: string; name?: string; fee?: number };
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
    if (payment.paymentFlow === "competition") {
      const registrationRef = doc(
        db,
        "competitionRegistrations",
        payment.registrationId,
      );
      const registrationSnapshot = await getDoc(registrationRef);
      const existingRegistration = registrationSnapshot.exists()
        ? registrationSnapshot.data()
        : null;
      const hallTicketNumber =
        existingRegistration?.hallTicketNumber ||
        existingRegistration?.competitionId ||
        generateCompetitionHallTicketNumber(orderId);

      if (registrationSnapshot.exists()) {
        await updateDoc(registrationRef, {
          hallTicketNumber,
          competitionId: hallTicketNumber,
          updatedAt: serverTimestamp(),
        });
      }

      await updateDoc(doc(db, "payments", paymentDoc.id), {
        hallTicketNumber,
        competitionId: hallTicketNumber,
        registrationCreatedAt: serverTimestamp(),
      });
    }

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

  if (payment.paymentFlow === "competition") {
    const competitionDraft = (payment.competitionRegistrationDraft || {}) as Record<
      string,
      any
    >;
    const competition = (payment.competition || {}) as Record<string, any>;

    const competitionRegistrationsRef = collection(db, "competitionRegistrations");
    const existingCompetitionQuery = query(
      competitionRegistrationsRef,
      where("orderId", "==", orderId),
    );
    const existingCompetitionSnapshot = await getDocs(existingCompetitionQuery);

    if (!existingCompetitionSnapshot.empty) {
      const existingCompetitionDoc = existingCompetitionSnapshot.docs[0];
      const existingId = existingCompetitionDoc.id;
      const existingCompetitionData = existingCompetitionDoc.data();
      const hallTicketNumber =
        existingCompetitionData.hallTicketNumber ||
        existingCompetitionData.competitionId ||
        generateCompetitionHallTicketNumber(orderId);

      await updateDoc(doc(db, "competitionRegistrations", existingId), {
        fullName: competitionDraft.fullName ?? "",
        gradeClass: competitionDraft.gradeClass ?? "",
        schoolName: competitionDraft.schoolName ?? "",
        cityState: competitionDraft.cityState ?? "",
        fullResidentialAddress: competitionDraft.fullResidentialAddress ?? "",
        parentGuardianName: competitionDraft.parentGuardianName ?? "",
        parentEmailAddress: competitionDraft.parentEmailAddress ?? "",
        studentEmailAddress: competitionDraft.studentEmailAddress ?? "",
        parentGuardianContactNumber:
          competitionDraft.parentGuardianContactNumber ?? "",
        emergencyContactNumber: competitionDraft.emergencyContactNumber ?? "",
        deviceAvailableForCompetition:
          competitionDraft.deviceAvailableForCompetition ?? "",
        previousExperience: competitionDraft.previousExperience ?? "",
        participatedBefore: competitionDraft.participatedBefore ?? "",
        preferredCodingPlatform: competitionDraft.preferredCodingPlatform ?? "",
        hallTicketNumber,
        competitionId: hallTicketNumber,
        competitionKey: competition.key ?? "",
        competitionName: competition.name ?? "",
        registrationFee: competition.fee ?? payment.amount ?? null,
        paymentType: payment.paymentType ?? "entry-fee",
        paidAmount: payment.amount ?? competition.fee ?? null,
        paymentStatus: payment.status ?? "SUCCESS",
        status: "confirmed",
        paymentId: payment.transactionReference || txnId || "",
        updatedAt: serverTimestamp(),
      });

      await updateDoc(doc(db, "payments", paymentDoc.id), {
        registrationId: existingId,
        hallTicketNumber,
        competitionId: hallTicketNumber,
        registrationCreatedAt: serverTimestamp(),
      });
      return { ok: true, registrationId: existingId };
    }

    const hallTicketNumber = generateCompetitionHallTicketNumber(orderId);
    const competitionRegistrationPayload = {
      fullName: competitionDraft.fullName ?? "",
      gradeClass: competitionDraft.gradeClass ?? "",
      schoolName: competitionDraft.schoolName ?? "",
      cityState: competitionDraft.cityState ?? "",
      fullResidentialAddress: competitionDraft.fullResidentialAddress ?? "",
      parentGuardianName: competitionDraft.parentGuardianName ?? "",
      parentEmailAddress: competitionDraft.parentEmailAddress ?? "",
      studentEmailAddress: competitionDraft.studentEmailAddress ?? "",
      parentGuardianContactNumber:
        competitionDraft.parentGuardianContactNumber ?? "",
      emergencyContactNumber: competitionDraft.emergencyContactNumber ?? "",
      deviceAvailableForCompetition:
        competitionDraft.deviceAvailableForCompetition ?? "",
      previousExperience: competitionDraft.previousExperience ?? "",
      participatedBefore: competitionDraft.participatedBefore ?? "",
      preferredCodingPlatform: competitionDraft.preferredCodingPlatform ?? "",
      agreedToTerms: Boolean(competitionDraft.agreedToTerms),
      hallTicketNumber,
      competitionId: hallTicketNumber,
      competitionKey: competition.key ?? "",
      competitionName: competition.name ?? "",
      registrationFee: competition.fee ?? payment.amount ?? null,
      paymentType: payment.paymentType ?? "entry-fee",
      paidAmount: payment.amount ?? competition.fee ?? null,
      paymentStatus: payment.status ?? "SUCCESS",
      paymentRemark: "Paid via CodeFest competition page",
      status: "confirmed",
      orderId,
      paymentId: payment.transactionReference || txnId || "",
      dateOfRegistration: new Date().toISOString().split("T")[0],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const competitionDocRef = await addDoc(
      competitionRegistrationsRef,
      competitionRegistrationPayload,
    );

    await updateDoc(doc(db, "payments", paymentDoc.id), {
      registrationId: competitionDocRef.id,
      studentName: competitionDraft.fullName ?? "",
      courseName: competition.name ?? "",
      courseKey: competition.key ?? "",
      parentEmail: competitionDraft.parentEmailAddress ?? "",
      primaryParentEmail: competitionDraft.parentEmailAddress ?? "",
      studentEmail: competitionDraft.studentEmailAddress ?? "",
      parentPhone: competitionDraft.parentGuardianContactNumber ?? "",
      primaryParentContact: competitionDraft.parentGuardianContactNumber ?? "",
      emergencyContactNumber: competitionDraft.emergencyContactNumber ?? "",
      hallTicketNumber,
      competitionId: hallTicketNumber,
      registrationCreatedAt: serverTimestamp(),
    });

    return { ok: true, registrationId: competitionDocRef.id };
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
