import { NextResponse } from "next/server";
import {
  collection,
  query,
  where,
  getDocs,
  writeBatch,
  doc,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "@/lib/firebase";
import { sendTrialReminderEmail } from "@/lib/mailer";

export const dynamic = "force-dynamic";

function getTodayIST(): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const year = parts.find((p) => p.type === "year")?.value;
  const month = parts.find((p) => p.type === "month")?.value;
  const day = parts.find((p) => p.type === "day")?.value;

  return `${year}-${month}-${day}`;
}

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const today = getTodayIST();

  try {
    const remindersQuery = query(
      collection(db, "freeTrialRegistrations"),
      where("status", "==", "booked"),
      where("trialDate", "==", today),
    );

    const snapshot = await getDocs(remindersQuery);

    const pending = snapshot.docs.filter(
      (docSnap) => docSnap.data().reminderSent !== true,
    );

    console.log(`⏰ TRIAL REMINDERS: ${pending.length} bookings for ${today}`);

    if (pending.length === 0) {
      return NextResponse.json({ success: true, sent: 0, date: today });
    }

    let sentCount = 0;
    const batch = writeBatch(db);

    for (const docSnap of pending) {
      const data = docSnap.data();

      try {
        await sendTrialReminderEmail({
          studentName: data.studentName,
          age: data.age,
          contactNumber: data.contactNumber,
          email: data.email,
          trialMode: data.trialMode,
          locationName: data.locationName,
          trialDate: data.trialDate,
          trialTime: data.trialTime,
        });

        batch.update(doc(db, "freeTrialRegistrations", docSnap.id), {
          reminderSent: true,
          reminderSentAt: serverTimestamp(),
        });

        sentCount += 1;
      } catch (err) {
        console.error(`❌ Reminder failed for ${docSnap.id}:`, err);
      }
    }

    await batch.commit();

    console.log(`✅ TRIAL REMINDERS SENT: ${sentCount}/${pending.length}`);

    return NextResponse.json({ success: true, sent: sentCount, total: pending.length, date: today });
  } catch (error) {
    console.error("❌ TRIAL REMINDER CRON ERROR:", error);
    return NextResponse.json({ success: false, message: "Reminder job failed." }, { status: 500 });
  }
}
