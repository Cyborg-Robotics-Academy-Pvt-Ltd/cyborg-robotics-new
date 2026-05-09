"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  Download,
  Mail,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import { enhancedCourseData } from "@/data/enhancedCourseData";
import Image from "next/image";
import { readOrderId } from "@/lib/order-id-storage";

type PaymentStatus = {
  orderId: string;
  amount?: number;
  status: string;
  transactionReference?: string;
  invoiceNumber?: string;
  courseName?: string;
};

export default function RegistrationSuccessClient() {
  const params = useSearchParams();
  const [orderId, setOrderId] = useState("");
  const [orderIdResolved, setOrderIdResolved] = useState(false);

  const [loading, setLoading] = useState(true);
  const [payment, setPayment] = useState<PaymentStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [emailStatus, setEmailStatus] = useState<string | null>(null);

  useEffect(() => {
    const fromQuery = params.get("orderId") || params.get("order_id") || "";
    setOrderId(fromQuery || readOrderId());
    setOrderIdResolved(true);
  }, [params]);

  // ? Recommended courses logic (exclude purchased course, match by category/age)
  const recommendedCourses = (() => {
    const courseName = payment?.courseName?.trim();
    if (!courseName) return [];

    const normalize = (v: string) => v.toLowerCase().replace(/[^a-z0-9]+/g, "");
    const normalizedName = normalize(courseName);

    // Find the purchased course
    const purchasedEntry = Object.entries(enhancedCourseData).find(
      ([, course]) => {
        const t = normalize(course.title);
        return (
          t === normalizedName ||
          normalizedName.includes(t) ||
          t.includes(normalizedName)
        );
      },
    );

    if (!purchasedEntry) return [];

    const [purchasedSlug, purchasedCourse] = purchasedEntry;

    // Score other courses by relevance
    return Object.entries(enhancedCourseData)
      .filter(([slug]) => slug !== purchasedSlug)
      .map(([slug, course]) => {
        let score = 0;
        if (course.category === purchasedCourse.category) score += 5;
        if (course.ageRange === purchasedCourse.ageRange) score += 2;
        return { slug, course, score };
      })
      .filter((c) => c.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 4);
  })();

  // ✅ Fetch payment status
  useEffect(() => {
    if (!orderIdResolved) return;

    if (!orderId) {
      setLoading(false);
      setError("Missing order ID.");
      return;
    }

    const controller = new AbortController();

    const load = async () => {
      try {
        setLoading(true);

        const res = await fetch(`/api/payment/status?orderId=${orderId}`, {
          signal: controller.signal,
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.message || "Failed to fetch payment status");
        }

        setPayment(data.payment);
      } catch (err) {
        if ((err as any).name === "AbortError") return;

        setError(err instanceof Error ? err.message : "Failed to load status");
      } finally {
        setLoading(false);
      }
    };

    load();

    return () => controller.abort();
  }, [orderId, orderIdResolved]);

  // ✅ Generate invoice (only once)
  useEffect(() => {
    if (!orderIdResolved) return;

    if (!orderId || payment?.status !== "SUCCESS" || payment?.invoiceNumber)
      return;

    const generateInvoice = async () => {
      try {
        const res = await fetch(
          `/api/payment/invoice?orderId=${orderId}&mode=json`,
        );
        const data = await res.json();

        if (res.ok && data.success && data.invoiceNumber) {
          setPayment((prev) =>
            prev ? { ...prev, invoiceNumber: data.invoiceNumber } : prev,
          );
        }
      } catch {
        // silent fail
      }
    };

    generateInvoice();
  }, [orderId, orderIdResolved, payment?.status, payment?.invoiceNumber]);

  // ✅ Email receipt
  const handleEmailReceipt = async () => {
    if (!orderId) return;

    try {
      setEmailStatus(null);

      const res = await fetch(
        `/api/payment/invoice?orderId=${orderId}&email=true&mode=json`,
      );

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to send receipt");
      }

      setEmailStatus("Receipt email sent successfully.");
    } catch (err) {
      setEmailStatus(
        err instanceof Error ? err.message : "Failed to send receipt",
      );
    }
  };

  // ✅ Loading state
  if (loading || !orderIdResolved) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-slate-600">Loading registration status...</div>
      </div>
    );
  }

  // ❌ Error state
  if (error || !orderId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="max-w-md text-center">
          <AlertCircle className="w-10 h-10 text-red-600 mx-auto mb-3" />
          <h1 className="text-2xl font-semibold">
            Registration Status Unavailable
          </h1>
          <p className="mt-2 text-gray-600">{error || "Missing order ID."}</p>

          <div className="flex gap-3 justify-center mt-6">
            <Link href="/all-courses">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                View Courses
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ❌ Not success
  if (payment?.status !== "SUCCESS") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="max-w-md text-center">
          <AlertCircle className="w-10 h-10 text-amber-600 mx-auto mb-3" />
          <h1 className="text-2xl font-semibold">Payment Not Confirmed</h1>
          <p className="mt-2 text-gray-600">
            Status: {payment?.status || "PENDING"}
          </p>
        </div>
      </div>
    );
  }

  const downloadUrl = `/api/payment/invoice?orderId=${orderId}`;

  // ✅ Recommended course logic
  const recommendedCourse = (() => {
    const courseName = payment?.courseName?.trim();
    if (!courseName) return null;

    const normalize = (v: string) => v.toLowerCase().replace(/[^a-z0-9]+/g, "");

    const normalizedName = normalize(courseName);

    const match = Object.entries(enhancedCourseData).find(([, course]) => {
      const normalizedTitle = normalize(course.title);
      return (
        normalizedTitle === normalizedName ||
        normalizedName.includes(normalizedTitle) ||
        normalizedTitle.includes(normalizedName)
      );
    });

    if (!match) return null;

    const [slug, course] = match;
    return { slug, course };
  })();
  // ✅ WhatsApp community links by category
  const WHATSAPP_LINKS: Record<string, string> = {
    Programming: "https://chat.whatsapp.com/REPLACE_PROGRAMMING",
    Robotics: "https://chat.whatsapp.com/REPLACE_ROBOTICS",
    Electronics: "https://chat.whatsapp.com/REPLACE_ELECTRONICS",
    "3D Printing": "https://chat.whatsapp.com/REPLACE_3DPRINTING",
    "Drone Technology": "https://chat.whatsapp.com/REPLACE_DRONE",
    "Lego-Robotics": "https://chat.whatsapp.com/REPLACE_LEGOROBOTICS",
    "LEGO Robotics Workshop": "https://chat.whatsapp.com/REPLACE_LEGOROBOTICS",
    "3D Design Workshop": "https://chat.whatsapp.com/REPLACE_3DPRINTING",
    "Drone Workshop": "https://chat.whatsapp.com/REPLACE_DRONE",
    "PictoBlox Workshop": "https://chat.whatsapp.com/REPLACE_PICTOBLOX",
    "Google Sites Portfolio Workshop":
      "https://chat.whatsapp.com/Kez45HjoVuXBXFEZhREfXT",
  };
  const WhatsAppIcon = () => (
    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
  const normalize = (v: string) => v.toLowerCase().replace(/[^a-z0-9]+/g, "");
  const workshopCommunityLabels: Record<string, string> = {
    legoroboticsworkshop: "Lego-Robotics Workshop",
    "3ddesignworkshop": "3D Design Workshop",
    droneworkshop: "Drone Workshop",
    pictobloxworkshop: "Pictoblox Workshop",
    googlesitesportfolioworkshop: "Google-Site Workshop",
  };
  const COMMUNITY_CARD_CONTENT: Record<
    string,
    { title: string; imageSrc: string; imageAlt: string }
  > = {
    Programming: {
      title: "Programming Community",
      imageSrc: "/assets/online-course/python.avif",
      imageAlt: "Programming community",
    },
    Robotics: {
      title: "Robotics Community",
      imageSrc: "/assets/classroom-course/ev3.png",
      imageAlt: "Robotics community",
    },
    Electronics: {
      title: "Electronics Community",
      imageSrc: "/assets/classroom-course/arduino.webp",
      imageAlt: "Electronics community",
    },
    "3D Printing": {
      title: "3D Design Community",
      imageSrc: "/assets/classroom-course/3d-printing.png",
      imageAlt: "3D design community",
    },
    "Drone Technology": {
      title: "Drone Community",
      imageSrc: "/assets/classroom-course/Drone.png",
      imageAlt: "Drone community",
    },
    "Lego-Robotics": {
      title: "Lego-Robotics Community",
      imageSrc: "/assets/workshops/lego/image.png",
      imageAlt: "Lego robotics community",
    },
    "LEGO Robotics Workshop": {
      title: "Lego-Robotics Workshop Community",
      imageSrc: "/assets/workshops/lego/image.png",
      imageAlt: "LEGO Robotics workshop",
    },
    "3D Design Workshop": {
      title: "3D Design Workshop Community",
      imageSrc: "/assets/workshops/3d-printing/IMG_0327.jpeg",
      imageAlt: "3D design workshop",
    },
    "Drone Workshop": {
      title: "Drone Workshop Community",
      imageSrc: "/assets/workshops/drone/Drone_1.jpeg",
      imageAlt: "Drone workshop",
    },
    "PictoBlox Workshop": {
      title: "Pictoblox Workshop Community",
      imageSrc: "/assets/workshops/pictoblox/image1.png",
      imageAlt: "Pictoblox workshop",
    },
    "Google Sites Portfolio Workshop": {
      title: "Google-Site Workshop Community",
      imageSrc: "/assets/workshops/google-site/Google-Site.png",
      imageAlt: "Google Site workshop",
    },
  };

  // ✅ Find purchased course entry
  const purchasedEntry = (() => {
    const courseName = payment?.courseName?.trim();
    if (!courseName) return null;
    const normalizedName = normalize(courseName);
    return (
      Object.entries(enhancedCourseData).find(([, course]) => {
        const t = normalize(course.title);
        return (
          t === normalizedName ||
          normalizedName.includes(t) ||
          t.includes(normalizedName)
        );
      }) ?? null
    );
  })();
  // ✅ WhatsApp info
  const whatsappInfo = (() => {
    const courseName = payment?.courseName?.trim();
    if (courseName) {
      const workshopLink = WHATSAPP_LINKS[courseName];
      const workshopLabel = workshopCommunityLabels[normalize(courseName)];
      const workshopCard = COMMUNITY_CARD_CONTENT[courseName];

      if (workshopLink && workshopLabel) {
        return {
          link: workshopLink,
          category: workshopLabel,
          title: workshopCard?.title || `${workshopLabel} Community`,
          imageSrc:
            workshopCard?.imageSrc || "/assets/classroom-course/ev3.png",
          imageAlt: workshopCard?.imageAlt || workshopLabel,
        };
      }
    }

    const activeCategory =
      purchasedEntry?.[1]?.category || recommendedCourse?.course.category;
    if (!activeCategory) return null;
    const link = WHATSAPP_LINKS[activeCategory];
    if (!link) return null;
    const card = COMMUNITY_CARD_CONTENT[activeCategory];
    return {
      link,
      category: activeCategory,
      title: card?.title || `${activeCategory} Community`,
      imageSrc: card?.imageSrc || "/assets/classroom-course/ev3.png",
      imageAlt: card?.imageAlt || activeCategory,
    };
  })();
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold">Registration Successful</h1>
        </div>

        {/* Payment Card */}
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <div className="space-y-2 text-sm">
            <p className="inline-flex items-center rounded-full bg-green-50 px-3 py-1 font-medium text-green-700">
              Payment Successful
            </p>
            <p>
              <b>Order:</b> {orderId}
            </p>
            {payment.amount !== undefined && payment.amount !== null && (
              <p className="text-lg font-semibold text-slate-900">
                ₹{payment.amount.toLocaleString("en-IN")}
              </p>
            )}
            <p>
              <b>Txn:</b> {payment.transactionReference}
            </p>
            <p>
              <b>Invoice:</b> {payment.invoiceNumber || "Generating..."}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 justify-center mb-6">
          <Link
            href="/registration/new"
            className="w-full sm:w-auto bg-red-700 hover:bg-red-800 text-white rounded-full flex items-center justify-center"
          >
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Registration
            </Button>
          </Link>

          <Link
            href={downloadUrl}
            className="w-full sm:w-auto bg-red-700 hover:bg-red-800 text-white rounded-full flex items-center justify-center"
          >
            <Button>
              <Download className="w-4 h-4 mr-2 " />
              Download
            </Button>
          </Link>

          {/* <Button onClick={handleEmailReceipt} disabled={emailSending}>
            <Mail className="w-4 h-4 mr-2" />
            {emailSending ? "Sending..." : "Email"}
          </Button> */}
        </div>
        {/* Community card */}
        {whatsappInfo && (
          <a
            href={whatsappInfo.link}
            target="_blank"
            rel="noopener noreferrer"
            className="block mb-6"
          >
            <div className="overflow-hidden w-86 rounded-2xl border border-green-100 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
              <div className="relative h-48 w-full overflow-hidden">
                <Image
                  src={whatsappInfo.imageSrc}
                  alt={whatsappInfo.imageAlt}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
                <div className="absolute left-4 top-4 inline-flex items-center rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-green-700 shadow-sm">
                  <WhatsAppIcon />
                  WhatsApp Community
                </div>
                <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                  <p className="text-lg font-semibold">{whatsappInfo.title}</p>
                  <p className="text-sm text-white/90">
                    Stay connected for updates, resources, and support.
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between gap-3 p-4">
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    Join {whatsappInfo.category}
                  </p>
                  <p className="text-xs text-slate-500">
                    Get workshop news and learning updates
                  </p>
                </div>
                <Button className="gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white">
                  <WhatsAppIcon />
                  Join Now
                </Button>
              </div>
            </div>
          </a>
        )}
        {emailStatus && (
          <p className="text-center mt-4 text-sm">{emailStatus}</p>
        )}

        {/* ── Recommended Courses ── */}
        {recommendedCourses.length > 0 && (
          <div className="mt-10">
            <div className="flex items-center gap-2 mb-5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <h2 className="text-base font-semibold text-slate-700">
                You Might Also Like
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {recommendedCourses.map(({ slug, course }) => (
                <Link key={slug} href={`/all-courses/${slug}`}>
                  <div className="bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer overflow-hidden group h-full flex flex-col">
                    <div className="relative overflow-hidden">
                      <Image
                        width={500}
                        height={300}
                        src={course.imagePath}
                        alt={course.imageAlt}
                        className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    </div>
                    <div className="p-4 flex flex-col flex-1">
                      <span className="inline-block text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full mb-2 w-fit">
                        {course.category}
                      </span>
                      <h3 className="font-semibold text-sm text-slate-800 leading-snug">
                        {course.title}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2 flex-1">
                        {course.subtitle}
                      </p>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-50">
                        <p className="text-sm font-bold text-slate-800">
                          ₹
                          {course.price?.toLocaleString("en-IN") ||
                            "N/A" ||
                            "N/A"}
                        </p>
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          Ages {course.ageRange}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
