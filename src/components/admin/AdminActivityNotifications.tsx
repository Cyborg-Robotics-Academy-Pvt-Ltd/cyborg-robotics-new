"use client";

import { useEffect } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { useAuth } from "@/lib/auth-context";
import { db } from "@/lib/firebase";
import { Toaster, toast } from "@/components/ui/toast";

const SUCCESS_PAYMENT_STATUSES = new Set([
  "SUCCESS",
  "CHARGED",
  "CONFIRMED",
  "CASH_PAY",
]);

function getDate(value: unknown): Date | null {
  let date: Date | null = null;

  if (value instanceof Date) {
    date = value;
  } else if (typeof value === "string" || typeof value === "number") {
    date = new Date(value);
  } else if (
    typeof value === "object" &&
    value !== null &&
    "toDate" in value &&
    typeof value.toDate === "function"
  ) {
    date = value.toDate();
  }

  return date && !Number.isNaN(date.getTime()) ? date : null;
}

function getRelativeTime(date: Date) {
  const minutesAgo = Math.ceil((Date.now() - date.getTime()) / 60_000);
  if (minutesAgo < 1) return "just now";
  if (minutesAgo < 60)
    return `${minutesAgo} minute${minutesAgo === 1 ? "" : "s"} ago`;

  const hoursAgo = Math.floor(minutesAgo / 60);
  if (hoursAgo < 24)
    return `${hoursAgo} hour${hoursAgo === 1 ? "" : "s"} ago`;

  const daysAgo = Math.floor(hoursAgo / 24);
  return `${daysAgo} day${daysAgo === 1 ? "" : "s"} ago`;
}

function playNotificationSound() {
  if (typeof window === "undefined" || !window.AudioContext) return;

  try {
    const audioContext = new window.AudioContext();
    const oscillator = audioContext.createOscillator();
    const volume = audioContext.createGain();
    const startTime = audioContext.currentTime;

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(880, startTime);
    oscillator.frequency.setValueAtTime(660, startTime + 0.1);
    volume.gain.setValueAtTime(0.0001, startTime);
    volume.gain.exponentialRampToValueAtTime(0.12, startTime + 0.01);
    volume.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.22);

    oscillator.connect(volume);
    volume.connect(audioContext.destination);
    oscillator.onended = () => {
      void audioContext.close();
    };
    oscillator.start(startTime);
    oscillator.stop(startTime + 0.22);

    void audioContext.resume().catch((error: unknown) => {
      console.error("Unable to play admin notification sound:", error);
      void audioContext.close();
    });
  } catch (error) {
    console.error("Unable to create admin notification sound:", error);
  }
}

export default function AdminActivityNotifications() {
  const { user, userRole, loading } = useAuth();

  useEffect(() => {
    if (loading || !user || userRole !== "admin") return;

    const storageKey = `admin-activity-toasts-${user.uid}`;
    const shownToastIds = new Set<string>();

    try {
      const storedIds = window.localStorage.getItem(storageKey);
      if (storedIds) {
        const parsedIds: unknown = JSON.parse(storedIds);
        if (
          Array.isArray(parsedIds) &&
          parsedIds.every((id): id is string => typeof id === "string")
        ) {
          parsedIds.forEach((id) => shownToastIds.add(id));
        } else {
          console.error("Invalid saved admin activity toast history.");
        }
      }
    } catch (error) {
      console.error("Unable to load admin activity toast history:", error);
    }

    const showActivityToast = (
      activityType: string,
      activityId: string,
      title: string,
      description: string,
      time: Date,
      toastType: string,
    ) => {
      const id = `admin-activity-${activityType}-${activityId}-${title}`;
      if (shownToastIds.has(id)) return;

      shownToastIds.add(id);
      toast.add({
        id,
        title,
        description: (
          <>
            {description} ·{" "}
            <span className="font-semibold text-current underline decoration-current/40 underline-offset-2">
              {getRelativeTime(time)}
            </span>
          </>
        ),
        type: toastType,
        timeout: 10000,
      });
      playNotificationSound();

      try {
        const toastIds = [...shownToastIds].slice(-500);
        shownToastIds.clear();
        toastIds.forEach((toastId) => shownToastIds.add(toastId));
        window.localStorage.setItem(storageKey, JSON.stringify(toastIds));
      } catch (error) {
        console.error("Unable to save admin activity toast history:", error);
      }
    };

    const isRecent = (date: Date) =>
      date.getTime() >= Date.now() - 7 * 24 * 60 * 60 * 1000;

    const studentsById = new Map<
      string,
      Record<string, unknown>
    >();
    let isInitialStudentSnapshot = true;
    let isInitialPaymentSnapshot = true;
    let isInitialTrainerSnapshot = true;

    const unsubscribeStudents = onSnapshot(
      collection(db, "students"),
      (snapshot) => {
        if (isInitialStudentSnapshot) {
          snapshot.docs.forEach((student) =>
            studentsById.set(student.id, student.data()),
          );
          isInitialStudentSnapshot = false;
          return;
        }

        snapshot.docChanges().forEach((change) => {
          const studentId = change.doc.id;
          const student = change.doc.data();
          const previousStudent = studentsById.get(studentId);
          studentsById.set(studentId, student);

          if (change.type === "added") {
            const createdAt = getDate(student.createdAt);
            if (createdAt && isRecent(createdAt)) {
              const studentName =
                student.fullName || student.username || "Student";
              showActivityToast(
                "registration",
                `student-${studentId}`,
                "New Student Registration",
                student.trainerName
                  ? `${studentName} has been assigned to trainer ${student.trainerName}`
                  : `${studentName} registered for courses`,
                createdAt,
                "registration",
              );
            }
            return;
          }

          if (!previousStudent || !Array.isArray(student.tasks)) return;
          const previousTasks = Array.isArray(previousStudent.tasks)
            ? previousStudent.tasks
            : [];

          student.tasks.forEach((task: Record<string, unknown>, index: number) => {
            if (
              JSON.stringify(task) === JSON.stringify(previousTasks[index]) ||
              !task ||
              typeof task !== "object"
            ) {
              return;
            }

            const taskTime = getDate(task.dateTime);
            if (!taskTime || !isRecent(taskTime)) return;

            const isComplete =
              String(task.status || "").trim().toLowerCase() === "complete";
            const studentName =
              student.fullName ||
              student.username ||
              student.studentName ||
              "Student";
            const courseName =
              task.course && typeof task.course === "object"
                ? String(
                    (task.course as Record<string, unknown>).name ||
                      (task.course as Record<string, unknown>).courseName ||
                      "Course",
                  )
                : String(task.course || "Course");

            showActivityToast(
              "class_task",
              `class-${studentId}-${index}`,
              isComplete ? "Class Completed" : "Class Updated",
              `${studentName} ${isComplete ? "completed" : "updated"} ${courseName}: ${String(task.task || "Class task")}`,
              taskTime,
              isComplete ? "class-completed" : "info",
            );
          });
        });
      },
      (error) => {
        console.error("Error monitoring student activity changes:", error);
      },
    );

    const unsubscribePayments = onSnapshot(
      collection(db, "payments"),
      (snapshot) => {
        if (isInitialPaymentSnapshot) {
          isInitialPaymentSnapshot = false;
          return;
        }

        snapshot.docChanges().forEach((change) => {
          const payment = change.doc.data();
          if (
            change.type === "removed" ||
            !SUCCESS_PAYMENT_STATUSES.has(
              String(payment.status || "").toUpperCase(),
            )
          ) {
            return;
          }

          const paidAt = getDate(payment.updatedAt || payment.createdAt);
          if (!paidAt || !isRecent(paidAt)) return;

          const studentName =
            payment.studentName ||
            payment.registrationDraft?.studentName ||
            payment.workshopRegistrationDraft?.childName ||
            payment.competitionRegistrationDraft?.fullName ||
            "Student";
          const courseName =
            payment.courseName ||
            payment.course?.name ||
            payment.workshop?.name ||
            payment.competition?.name ||
            "program";
          const amount = new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0,
          }).format(Number(payment.amount) || 0);

          showActivityToast(
            "payment",
            `payment-${change.doc.id}`,
            "Payment Received",
            `${studentName} paid ${amount} for ${courseName}`,
            paidAt,
            "payment",
          );
        });
      },
      (error) => {
        console.error("Error monitoring payment activity changes:", error);
      },
    );

    const unsubscribeTrainers = onSnapshot(
      collection(db, "trainers"),
      (snapshot) => {
        if (isInitialTrainerSnapshot) {
          isInitialTrainerSnapshot = false;
          return;
        }

        snapshot.docChanges().forEach((change) => {
          if (change.type !== "added") return;

          const trainer = change.doc.data();
          const createdAt = getDate(trainer.createdAt);
          if (!createdAt || !isRecent(createdAt)) return;

          showActivityToast(
            "trainer_added",
            `trainer-${change.doc.id}`,
            "Instructor Added",
            `${trainer.name || trainer.username || trainer.email || "A trainer"} joined as instructor`,
            createdAt,
            "info",
          );
        });
      },
      (error) => {
        console.error("Error monitoring trainer activity changes:", error);
      },
    );

    return () => {
      unsubscribeStudents();
      unsubscribePayments();
      unsubscribeTrainers();
    };
  }, [loading, user, userRole]);

  return <Toaster timeout={10000} limit={3} />;
}
