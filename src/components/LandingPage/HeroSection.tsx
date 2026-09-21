"use client";

import React, { FormEvent, useEffect, useMemo, useRef, useState } from "react";

import {
  ArrowLeft,
  ArrowRight,
  Calendar as CalendarIcon,
  CalendarCheck,
  CheckCircle2,
  Clock3,
  GraduationCap,
  Loader2,
  Lock,
  Mail,
  MapPin,
  Phone,
  Sparkles,
  Star,
  Trophy,
  UserRound,
  Users,
  Wifi,
  XCircle,
  Play,
  MoreHorizontal,
  Send,
  MessageCircle,
  Heart,
  HeartIcon,
  Bot,
  Pause,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import Image from "next/image";

/* -------------------------------------------------------------------------- */
/* TYPES                                                                      */
/* -------------------------------------------------------------------------- */

type TrialMode = "online" | "offline";
type Step = 1 | 2;

interface TrialLocation {
  id: string;
  name: string;
  shortName: string;
  address: string;
  lat: number;
  lng: number;
  offlineSlots: string[];
  offlineDaysClosed: number[];
}

interface GeocodedLocation {
  lat: number;
  lng: number;
  displayName: string;
}

/* -------------------------------------------------------------------------- */
/* FORM                                                                       */
/* -------------------------------------------------------------------------- */

const initialForm = {
  studentName: "",
  age: "",
  contactNumber: "",
  email: "",
  location: "",
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* -------------------------------------------------------------------------- */
/* ONLINE CONFIG                                                              */
/* -------------------------------------------------------------------------- */

const ONLINE_CONFIG = {
  slots: ["10:00", "12:00", "15:00", "17:00", "19:00"],
  daysClosed: [0],
};

/* -------------------------------------------------------------------------- */
/* OFFLINE CENTERS                                                            */
/* -------------------------------------------------------------------------- */

const LOCATIONS: TrialLocation[] = [
  {
    id: "kalyani-nagar",
    name: "Cyborg Robotics – Kalyani Nagar, Pune",
    shortName: "Kalyani Nagar, Pune",
    address: "Kalyani Nagar, Pune, Maharashtra",
    lat: 18.5486,
    lng: 73.9027,
    offlineSlots: ["10:00", "11:00", "14:00", "16:00"],
    offlineDaysClosed: [0],
  },
  {
    id: "kharadi",
    name: "Cyborg Robotics – Kharadi, Pune",
    shortName: "Kharadi, Pune",
    address: "Kharadi, Pune, Maharashtra",
    lat: 18.5511,
    lng: 73.9477,
    offlineSlots: ["11:00", "13:00", "15:00", "17:00"],
    offlineDaysClosed: [0],
  },
  {
    id: "magarpatta",
    name: "Cyborg Robotics – Magarpatta, Pune",
    shortName: "Magarpatta, Pune",
    address: "Magarpatta, Pune, Maharashtra",
    lat: 18.5134,
    lng: 73.927,
    offlineSlots: ["10:00", "12:00", "15:00", "17:00"],
    offlineDaysClosed: [0],
  },
];

/*
 * <= 20 km from the nearest center => OFFLINE
 * > 20 km => ONLINE
 */
const MAX_OFFLINE_DISTANCE_KM = 20;

/* -------------------------------------------------------------------------- */
/* CONTINUE-AFTER-TRIAL CENTER OPTIONS                                       */
/* -------------------------------------------------------------------------- */

const CONTINUE_CENTERS: { id: string; label: string }[] = [
  { id: "kalyani-nagar", label: "Kalyani Nagar, Pune" },
  { id: "magarpatta", label: "Magarpatta, Pune" },
  { id: "kharadi", label: "Kharadi, Pune" },
];

/* -------------------------------------------------------------------------- */
/* HERO STATS                                                                 */
/* -------------------------------------------------------------------------- */

const STATS = [
  { icon: Users, value: "2,500+", label: "Students" },
  { icon: Trophy, value: "50+", label: "Competitions Participated" },
  { icon: GraduationCap, value: "25+", label: "Expert Mentors" },
  { icon: Star, value: "4.9/5", label: "Parent Rating" },
];

/* -------------------------------------------------------------------------- */
/* DISTANCE                                                                   */
/* -------------------------------------------------------------------------- */

function getDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;

  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function findNearestLocation(
  userLat: number,
  userLng: number,
  locations: TrialLocation[],
) {
  if (!locations.length) return null;

  let nearest = locations[0];

  let nearestDistance = getDistanceKm(
    userLat,
    userLng,
    nearest.lat,
    nearest.lng,
  );

  for (const location of locations.slice(1)) {
    const distance = getDistanceKm(
      userLat,
      userLng,
      location.lat,
      location.lng,
    );

    if (distance < nearestDistance) {
      nearest = location;
      nearestDistance = distance;
    }
  }

  return {
    location: nearest,
    distanceKm: nearestDistance,
  };
}

/* -------------------------------------------------------------------------- */
/* DATE HELPERS                                                               */
/* -------------------------------------------------------------------------- */

function toLocalISODate(date: Date | undefined): string {
  if (!date || Number.isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getMinBookableDate() {
  const date = new Date();

  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + 1);

  return date;
}

/* -------------------------------------------------------------------------- */
/* COMPONENT                                                                  */
/* -------------------------------------------------------------------------- */

const HeroSection = () => {
  /* ------------------------------------------------------------------------ */
  /* DIALOG / STEP                                                            */
  /* ------------------------------------------------------------------------ */

  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>(1);

  /* ------------------------------------------------------------------------ */
  /* FORM                                                                     */
  /* ------------------------------------------------------------------------ */

  const [form, setForm] = useState(initialForm);

  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const reelVideoRef = useRef<HTMLVideoElement>(null);
  const [reelDuration, setReelDuration] = useState(0);
  const [reelCurrentTime, setReelCurrentTime] = useState(0);
  useEffect(() => {
    const video = reelVideoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      if (Number.isFinite(video.duration)) {
        setReelDuration(video.duration);
      }
    };

    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.load();

    video
      .play()
      .then(() => setIsReelPlaying(true))
      .catch(() => setIsReelPlaying(false)); // autoplay blocked — falls back to showing the play button

    return () =>
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
  }, []);
  const [isReelPlaying, setIsReelPlaying] = useState(false);
  const [reelProgress, setReelProgress] = useState(0);
  const formatTime = (seconds: number) => {
    if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
    const s = Math.floor(seconds);
    const m = Math.floor(s / 60);
    const remSec = s % 60;
    return `${m}:${remSec.toString().padStart(2, "0")}`;
  };
  const handleReelSeek = (event: React.MouseEvent<HTMLDivElement>) => {
    const video = reelVideoRef.current;
    if (!video || !video.duration) return;

    const bar = event.currentTarget;
    const rect = bar.getBoundingClientRect();
    const ratio = Math.min(
      Math.max((event.clientX - rect.left) / rect.width, 0),
      1,
    );

    video.currentTime = ratio * video.duration;
    setReelProgress(ratio * 100);
  };
  const toggleReelPlayback = () => {
    const video = reelVideoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
      setIsReelPlaying(true);
    } else {
      video.pause();
      setIsReelPlaying(false);
    }
  };
  /* ------------------------------------------------------------------------ */
  /* LOCATION / MODE                                                          */
  /* ------------------------------------------------------------------------ */

  const [trial, setTrial] = useState<TrialMode>("online");

  const [locationId, setLocationId] = useState<string | null>(null);

  const [detectedLocation, setDetectedLocation] =
    useState<GeocodedLocation | null>(null);

  const [locationLoading, setLocationLoading] = useState(false);
  const [locationVerified, setLocationVerified] = useState(false);
  const [locationMessage, setLocationMessage] = useState("");

  const locationRequestIdRef = useRef(0);

  const locationDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  /* ------------------------------------------------------------------------ */
  /* CONTINUE-AFTER-TRIAL CENTER PREFERENCE                                  */
  /* ------------------------------------------------------------------------ */

  const [preferredCenter, setPreferredCenter] = useState<string | null>(null);
  const [preferredCenterError, setPreferredCenterError] = useState("");

  /* ------------------------------------------------------------------------ */
  /* API STATE                                                                */
  /* ------------------------------------------------------------------------ */

  const [leadId, setLeadId] = useState<string | null>(null);
  const [savingLead, setSavingLead] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof typeof initialForm, string>>
  >({});

  const [notice, setNotice] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const [successOpen, setSuccessOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  /* ------------------------------------------------------------------------ */
  /* UI                                                                       */
  /* ------------------------------------------------------------------------ */

  const sectionRef = useRef<HTMLElement>(null);
  const [showTrialOverlayText, setShowTrialOverlayText] = useState(false);

  const minBookableDate = useMemo(() => getMinBookableDate(), []);

  /* ------------------------------------------------------------------------ */
  /* SELECTED CENTER                                                          */
  /* ------------------------------------------------------------------------ */

  const selectedLocation = useMemo(() => {
    if (trial !== "offline" || !locationId) return null;

    return LOCATIONS.find((location) => location.id === locationId) ?? null;
  }, [trial, locationId]);

  /* ------------------------------------------------------------------------ */
  /* ACTIVE SLOTS                                                             */
  /* ------------------------------------------------------------------------ */

  const activeSlots = useMemo(() => {
    if (trial === "online") {
      return ONLINE_CONFIG.slots;
    }

    return selectedLocation?.offlineSlots ?? [];
  }, [trial, selectedLocation]);

  const activeDaysClosed = useMemo(() => {
    if (trial === "online") {
      return ONLINE_CONFIG.daysClosed;
    }

    return selectedLocation?.offlineDaysClosed ?? [];
  }, [trial, selectedLocation]);

  /* ------------------------------------------------------------------------ */
  /* MODE LABEL                                                               */
  /* ------------------------------------------------------------------------ */

  const modeLabel = trial === "offline" ? "Offline" : "Online";

  const locationLabel =
    trial === "offline"
      ? (selectedLocation?.shortName ?? "Nearest center")
      : "Online trial";

  /* ------------------------------------------------------------------------ */
  /* FULL RESET                                                               */
  /* ------------------------------------------------------------------------ */

  const resetDialogState = () => {
    locationRequestIdRef.current += 1;

    if (locationDebounceRef.current) {
      clearTimeout(locationDebounceRef.current);
      locationDebounceRef.current = null;
    }

    setStep(1);

    setForm(initialForm);

    setSelectedDate(undefined);
    setSelectedTime(null);

    setTrial("online");
    setLocationId(null);

    setDetectedLocation(null);
    setLocationLoading(false);
    setLocationVerified(false);
    setLocationMessage("");

    setPreferredCenter(null);
    setPreferredCenterError("");

    setLeadId(null);
    setSavingLead(false);
    setSubmitting(false);

    setFieldErrors({});
    setNotice(null);
  };

  /* ------------------------------------------------------------------------ */
  /* RESET ONLY SCHEDULE / STEP                                               */
  /* ------------------------------------------------------------------------ */

  const resetScheduleState = () => {
    setStep(1);
    setSelectedDate(undefined);
    setSelectedTime(null);
    setNotice(null);
    setFieldErrors({});
  };

  /* ------------------------------------------------------------------------ */
  /* DATE DISABLED                                                             */
  /* ------------------------------------------------------------------------ */

  const isDateDisabledForMode = (date: Date) => {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
      return true;
    }

    const normalized = new Date(date);
    normalized.setHours(0, 0, 0, 0);

    if (normalized < minBookableDate) {
      return true;
    }

    return activeDaysClosed.includes(normalized.getDay());
  };

  /* ------------------------------------------------------------------------ */
  /* AUTO OPEN                                                                */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    setOpen(true);
  }, []);

  /* ------------------------------------------------------------------------ */
  /* HERO OBSERVER                                                            */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    const node = sectionRef.current;

    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShowTrialOverlayText(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  /* ------------------------------------------------------------------------ */
  /* UPDATE FIELD                                                             */
  /* ------------------------------------------------------------------------ */

  const updateField = (field: keyof typeof initialForm, value: string) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setNotice(null);

    setFieldErrors((current) => ({
      ...current,
      [field]: undefined,
    }));
  };

  /* ------------------------------------------------------------------------ */
  /* GEOCODE                                                                  */
  /* ------------------------------------------------------------------------ */

  const geocodeAddress = async (address: string) => {
    const requestId = ++locationRequestIdRef.current;

    const trimmed = address.trim();

    if (!trimmed) {
      setDetectedLocation(null);
      setLocationVerified(false);
      setLocationMessage("");
      setLocationId(null);
      setTrial("online");
      setLocationLoading(false);
      return;
    }

    setLocationLoading(true);
    setLocationVerified(false);
    setLocationId(null);
    setTrial("online");
    setLocationMessage("Finding your location...");

    try {
      const searchAddress = trimmed.toLowerCase().includes("india")
        ? trimmed
        : `${trimmed}, India`;

      const url =
        "https://nominatim.openstreetmap.org/search" +
        "?format=json" +
        "&limit=1" +
        "&addressdetails=1" +
        "&countrycodes=in" +
        `&q=${encodeURIComponent(searchAddress)}`;

      const response = await fetch(url, {
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Unable to find location.");
      }

      const results = await response.json();

      if (requestId !== locationRequestIdRef.current) return;

      if (!Array.isArray(results) || results.length === 0) {
        setDetectedLocation(null);
        setLocationVerified(false);
        setTrial("online");
        setLocationId(null);

        setLocationMessage(
          "Location not found. Please enter a valid city, area or address.",
        );

        return;
      }

      const lat = Number(results[0].lat);
      const lng = Number(results[0].lon);

      if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        throw new Error("Invalid location coordinates.");
      }

      const geocoded: GeocodedLocation = {
        lat,
        lng,
        displayName: results[0].display_name,
      };

      setDetectedLocation(geocoded);

      const nearest = findNearestLocation(lat, lng, LOCATIONS);

      if (!nearest) {
        setTrial("online");
        setLocationId(null);
        setLocationVerified(true);
        setLocationMessage("Online trial selected.");
        return;
      }

      const distance = nearest.distanceKm;

      if (distance <= MAX_OFFLINE_DISTANCE_KM) {
        setTrial("offline");
        setLocationId(nearest.location.id);
        setLocationVerified(true);

        setLocationMessage(
          "Trial class will be conducted at our headquarters in Kalyani Nagar, Pune.",
        );
      } else {
        setTrial("online");
        setLocationId(null);
        setLocationVerified(true);

        setLocationMessage("Trial class will be conducted online.");
      }
    } catch (error) {
      console.error("Geocoding error:", error);

      if (requestId !== locationRequestIdRef.current) return;

      setDetectedLocation(null);
      setLocationVerified(false);
      setTrial("online");
      setLocationId(null);

      setLocationMessage(
        "Could not verify this location. Please enter a valid location.",
      );
    } finally {
      if (requestId === locationRequestIdRef.current) {
        setLocationLoading(false);
      }
    }
  };

  /* ------------------------------------------------------------------------ */
  /* LOCATION INPUT                                                           */
  /* ------------------------------------------------------------------------ */

  const handleLocationChange = (value: string) => {
    updateField("location", value);

    setDetectedLocation(null);
    setLocationVerified(false);
    setLocationMessage("");

    setTrial("online");
    setLocationId(null);

    if (locationDebounceRef.current) {
      clearTimeout(locationDebounceRef.current);
    }

    if (value.trim().length < 3) {
      setLocationLoading(false);
      return;
    }

    setLocationLoading(true);

    locationDebounceRef.current = setTimeout(() => {
      geocodeAddress(value);
    }, 800);
  };

  /* ------------------------------------------------------------------------ */
  /* CONTINUE-CENTER CHECKBOX                                                */
  /* ------------------------------------------------------------------------ */

  const handlePreferredCenterToggle = (id: string) => {
    // Single-select behaviour via checkboxes: picking one clears the rest.
    setPreferredCenter((current) => (current === id ? null : id));
    setPreferredCenterError("");
    setNotice(null);
  };

  /* ------------------------------------------------------------------------ */
  /* VALIDATE STEP 1                                                         */
  /* ------------------------------------------------------------------------ */

  const validateStepOne = () => {
    const errors: Partial<Record<keyof typeof initialForm, string>> = {};

    const studentName = form.studentName.trim();
    const age = form.age.trim();
    const contactNumber = form.contactNumber.trim();
    const email = form.email.trim();
    const location = form.location.trim();

    if (!studentName) {
      errors.studentName = "Student name is required.";
    }

    const ageNum = Number(age);

    if (!age || Number.isNaN(ageNum) || ageNum < 4 || ageNum > 18) {
      errors.age = "Enter a valid age (4–18).";
    }

    if (!/^\d{10}$/.test(contactNumber)) {
      errors.contactNumber = "Enter a valid 10 digit mobile number.";
    }

    if (!EMAIL_REGEX.test(email)) {
      errors.email = "Enter a valid email address.";
    }

    if (!location) {
      errors.location = "Please enter your location.";
    }

    if (location && !locationVerified) {
      errors.location = "Please wait for your location to be verified.";
    }

    if (trial === "offline" && !selectedLocation) {
      errors.location =
        "Nearest offline center could not be determined. Please verify your location again.";
    }

    setFieldErrors(errors);

    let preferredCenterOk = true;

    if (!preferredCenter) {
      setPreferredCenterError(
        "Please select which center you'd like to continue at.",
      );
      preferredCenterOk = false;
    } else {
      setPreferredCenterError("");
    }

    return Object.keys(errors).length === 0 && preferredCenterOk;
  };

  /* ------------------------------------------------------------------------ */
  /* BUILD PAYLOAD (shared by both save paths)                               */
  /* ------------------------------------------------------------------------ */

  const buildPayload = (options: {
    status: "incomplete" | "booked";
    trialDate: string | null;
    trialTime: string | null;
  }) => ({
    studentName: form.studentName.trim(),
    age: Number(form.age),
    contactNumber: form.contactNumber.trim(),
    email: form.email.trim().toLowerCase(),

    location: form.location.trim(),

    latitude: detectedLocation?.lat ?? null,
    longitude: detectedLocation?.lng ?? null,

    trialMode: trial,

    locationId: trial === "offline" ? (selectedLocation?.id ?? null) : null,

    locationName:
      trial === "offline" ? (selectedLocation?.shortName ?? null) : "Online",

    // Which center the student wants to continue classes at after the
    // (headquarters) trial. Stored as-is, no other behaviour depends on it
    // except gating the time-slot step below.
    preferredCenter,

    trialDate: options.trialDate,
    trialTime: options.trialTime,

    status: options.status,

    nextFollowUpDate: null,
    assignedTo: null,
    remark: "",

    source: "website",
    createdFrom: "free-trial-page",
  });

  /* ------------------------------------------------------------------------ */
  /* SAVE LEAD -> GO TO SLOTS (or finalize directly)                          */
  /* ------------------------------------------------------------------------ */

  const handleNextFromStep1 = async () => {
    if (!validateStepOne()) return;

    if (locationLoading) {
      setNotice({
        type: "error",
        message: "Please wait while we verify your location.",
      });
      return;
    }

    if (!locationVerified) {
      setNotice({
        type: "error",
        message: "Please wait for your location to be verified.",
      });
      return;
    }

    if (trial === "offline" && !selectedLocation) {
      setNotice({
        type: "error",
        message: "Offline center could not be determined.",
      });
      return;
    }

    // Only students continuing at Kalyani Nagar go on to pick a trial
    // date/time slot. Everyone else is saved directly, no slot step.
    const skipTimeSlot = preferredCenter !== "kalyani-nagar";

    setSavingLead(true);
    setNotice(null);

    const payload = buildPayload(
      skipTimeSlot
        ? { status: "booked", trialDate: null, trialTime: null }
        : { status: "incomplete", trialDate: null, trialTime: null },
    );

    console.log("STEP 1 PAYLOAD:", payload);

    try {
      const response = await fetch(
        leadId ? `/api/free-trial/${leadId}` : "/api/free-trial",
        {
          method: leadId ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Could not save your details.");
      }

      if (data.id) {
        setLeadId(data.id);
      }

      const serverMode: TrialMode =
        data.trialMode === "offline" || data.trialMode === "online"
          ? data.trialMode
          : trial;

      if (serverMode === "offline") {
        const serverLocationId =
          typeof data.locationId === "string" ? data.locationId : locationId;

        const validServerLocation = LOCATIONS.some(
          (location) => location.id === serverLocationId,
        );

        setTrial("offline");

        if (validServerLocation) {
          setLocationId(serverLocationId);
        }
      } else {
        setTrial("online");
        setLocationId(null);
      }

      if (skipTimeSlot) {
        // No time slot for non-Kalyani-Nagar preference — done here.
        setStep(1);
        setForm(initialForm);
        setSelectedDate(undefined);
        setSelectedTime(null);
        setLeadId(null);

        setTrial("online");
        setLocationId(null);

        setDetectedLocation(null);
        setLocationMessage("");
        setLocationVerified(false);

        setPreferredCenter(null);
        setPreferredCenterError("");

        setFieldErrors({});
        setNotice(null);

        setOpen(false);
        setSuccessMessage(
          "Your trial is booked successfully. Our team will contact you shortly.",
        );
        setSuccessOpen(true);
      } else {
        setSelectedDate(undefined);
        setSelectedTime(null);
        setStep(2);
        setNotice(null);
      }
    } catch (error) {
      console.error("Lead save error:", error);

      setNotice({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Unable to save your details.",
      });
    } finally {
      setSavingLead(false);
    }
  };

  /* ------------------------------------------------------------------------ */
  /* BACK                                                                     */
  /* ------------------------------------------------------------------------ */

  const handleBack = () => {
    setNotice(null);

    if (step === 2) {
      setSelectedDate(undefined);
      setSelectedTime(null);
      setStep(1);
    }
  };

  /* ------------------------------------------------------------------------ */
  /* FINAL SUBMIT                                                             */
  /* ------------------------------------------------------------------------ */

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedDate) {
      setNotice({
        type: "error",
        message: "Please select a trial date.",
      });
      return;
    }

    if (!selectedTime) {
      setNotice({
        type: "error",
        message: "Please select a trial time.",
      });
      return;
    }

    if (!locationVerified) {
      setStep(1);
      setNotice({
        type: "error",
        message: "Location verification is required.",
      });
      return;
    }

    if (trial === "offline" && !selectedLocation) {
      setStep(1);
      setNotice({
        type: "error",
        message: "Offline center could not be determined.",
      });
      return;
    }

    const trialDate = toLocalISODate(selectedDate);

    if (!trialDate) {
      setNotice({
        type: "error",
        message: "Please select a valid trial date.",
      });
      return;
    }

    setSubmitting(true);
    setNotice(null);

    const payload = buildPayload({
      status: "booked",
      trialDate,
      trialTime: selectedTime,
    });

    console.log("FINAL BOOKING PAYLOAD:", payload);

    try {
      const response = await fetch(
        leadId ? `/api/free-trial/${leadId}` : "/api/free-trial",
        {
          method: leadId ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Registration failed.");
      }

      setStep(1);
      setForm(initialForm);
      setSelectedDate(undefined);
      setSelectedTime(null);
      setLeadId(null);

      setTrial("online");
      setLocationId(null);

      setDetectedLocation(null);
      setLocationMessage("");
      setLocationVerified(false);

      setPreferredCenter(null);
      setPreferredCenterError("");

      setFieldErrors({});
      setNotice(null);

      setOpen(false);
      setSuccessMessage(
        "Your trial is booked successfully. Our team will contact you shortly.",
      );
      setSuccessOpen(true);
    } catch (error) {
      console.error("Registration error:", error);

      setNotice({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Unable to save registration.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  /* ------------------------------------------------------------------------ */
  /* RENDER                                                                   */
  /* ------------------------------------------------------------------------ */

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden bg-white px-6 py-8 font-sans md:pt-20 lg:flex lg:min-h-screen lg:items-center"
    >
      {/* ------------------------------------------------------------------ */}
      {/* HERO OVERLAY                                                        */}
      {/* ------------------------------------------------------------------ */}

      <div
        aria-hidden={!showTrialOverlayText}
        className={`pointer-events-none absolute left-1/2 top-4 z-20 -translate-x-1/2 transition-all duration-700 ${
          showTrialOverlayText
            ? "translate-y-0 opacity-100"
            : "-translate-y-2 opacity-0"
        }`}
      >
        <span className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-white/90 px-4 py-1.5 text-xs font-semibold shadow-md backdrop-blur-sm md:text-sm">
          <Sparkles size={14} className="text-red-600" />
          See what your child will do in a trial class
        </span>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* BACKGROUND                                                          */}
      {/* ------------------------------------------------------------------ */}

      <div className="pointer-events-none absolute inset-0 opacity-10">
        <svg
          className="h-full w-full"
          viewBox="0 0 1440 800"
          fill="none"
          preserveAspectRatio="xMidYMid slice"
        >
          <g stroke="#3D3D3D" strokeWidth="1">
            <path d="M0 120 H180 L220 160 H420" />
            <path d="M1440 90 H1240 L1200 130 H1000 L960 90" />
            <path d="M0 620 H140 L180 660 H360 L400 700" />
            <path d="M1440 700 H1260 L1220 660 H1040" />
            <path d="M700 0 V80 L740 120 V260" />
            <path d="M760 800 V680 L720 640 V520" />
          </g>

          <g fill="#ED1C24">
            <circle cx="420" cy="160" r="4" />
            <circle cx="960" cy="90" r="4" />
            <circle cx="400" cy="700" r="4" />
            <circle cx="1040" cy="660" r="4" />
            <circle cx="740" cy="260" r="4" />
            <circle cx="720" cy="520" r="4" />
          </g>
        </svg>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* HERO CONTENT                                                        */}
      {/* ------------------------------------------------------------------ */}

      <div className="relative z-10 mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-14">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-white px-5 py-1.5 text-xs font-bold uppercase tracking-wide md:text-sm">
            <span>LEARN</span>
            <span className="h-1 w-1 rounded-full bg-red-600" />
            <span>BUILD</span>
            <span className="h-1 w-1 rounded-full bg-red-600" />
            <span>INNOVATE</span>
          </div>

          <h1 className="mb-4 mt-4 text-3xl font-extrabold uppercase leading-[1.05] tracking-tight lg:text-4xl">
            Robotics, Coding & AI
            <br />
            classes your child joins
            <br />
            <span className="bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">
              From Home
            </span>
            <br />
          </h1>

          <p className="mb-6 max-w-md text-base leading-relaxed text-gray-700 lg:text-lg">
            From beginner-friendly animation & coding to Arduino kits and Python
            - live, instructor-led online classes for ages 6 and up. Choose
            group or 1:1, pick your child's course, and start with a free trial.
          </p>

          <div className="mb-6 flex flex-wrap items-stretch">
            {STATS.map((stat, index) => (
              <React.Fragment key={stat.label}>
                <div className="flex flex-col gap-1 px-4 first:pl-0 lg:px-5">
                  <stat.icon className="h-5 w-5 text-red-600" />

                  <span className="text-xl font-bold leading-none lg:text-2xl">
                    {stat.value}
                  </span>

                  <span className="max-w-[110px] text-xs leading-tight text-gray-500 lg:text-sm">
                    {stat.label}
                  </span>
                </div>

                {index < STATS.length - 1 && (
                  <div className="my-0.5 w-px self-stretch bg-gray-200" />
                )}
              </React.Fragment>
            ))}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {/* Primary CTA */}
            <button
              type="button"
              className="group inline-flex h-[52px] items-center justify-center gap-2.5 rounded-lg bg-gradient-to-r from-red-600 to-red-700 px-7 text-base font-bold text-white shadow-[0_8px_24px_-6px_#ED1C24] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_-6px_#ED1C24] lg:text-lg"
              onClick={() => {
                resetScheduleState();
                setOpen(true);
              }}
            >
              <CalendarIcon size={18} />

              <span>BOOK A TRIAL</span>

              <ArrowRight
                size={18}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </button>

            {/* Secondary CTA */}
            <button
              type="button"
              onClick={() => {
                document
                  .getElementById("courses")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
              className="group inline-flex h-[52px] items-center justify-center gap-2 rounded-lg border-2 border-gray-200 bg-white px-7 text-base font-bold text-gray-900 transition-all duration-300 hover:-translate-y-0.5 hover:border-red-200 hover:bg-red-50 hover:text-red-700 lg:text-lg"
            >
              <span>EXPLORE COURSES</span>

              <ArrowRight
                size={18}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </button>
          </div>

          <div className="mt-3 flex items-center gap-2 text-xs text-gray-500 lg:text-sm">
            <Lock size={13} className="text-red-600" />
            <span>No commitment. Just a trial class experience.</span>
          </div>
        </div>
        <div className="group relative mx-auto w-80 max-h-[500px] max-w-sm aspect-[9/16] overflow-hidden rounded-3xl border border-red-100 bg-black shadow-2xl">
          {/* background video */}
          <video
            ref={reelVideoRef}
            src="https://res.cloudinary.com/dqiarwxml/video/upload/v1787381371/Dropping_seeds_of_innovation_literally_Say_hello_to_Chlorofy_s_plantable_thank-you_cards._We_piwgee.mp4"
            poster="/images/cyborg-hero-poster.jpg"
            className="absolute inset-0 h-full w-full cursor-pointer object-cover"
            muted
            playsInline
            loop
            preload="metadata"
            onClick={toggleReelPlayback}
            onLoadedMetadata={(e) => setReelDuration(e.currentTarget.duration)}
            onTimeUpdate={(e) => {
              const video = e.currentTarget;
              setReelCurrentTime(video.currentTime);
              if (video.duration) {
                setReelProgress((video.currentTime / video.duration) * 100);
              }
            }}
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/50" />

          <div className="absolute inset-x-0 top-0 flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full ">
                <Image
                  width={40}
                  height={40}
                  src="/cyborglogo.png"
                  alt="Cyborg Robotics"
                  className="h-full w-full object-cover"
                />
              </span>
              <span className="text-sm font-semibold text-white">
                Cyborg Robotics
              </span>
            </div>
            <span className="text-sm font-medium text-white/90 bg-red-800 p-1 rounded-xl">
              {formatTime(reelDuration - reelCurrentTime)}
            </span>
          </div>

          <button
            type="button"
            aria-label={isReelPlaying ? "Pause video" : "Play video"}
            onClick={toggleReelPlayback}
            className={`absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-black/30 backdrop-blur-sm transition-opacity duration-200 ${
              isReelPlaying
                ? "opacity-0 group-hover:opacity-100"
                : "opacity-100"
            }`}
          >
            {isReelPlaying ? (
              <Pause className="h-6 w-6 fill-white text-white" />
            ) : (
              <Play className="h-6 w-6 fill-white text-white" />
            )}
          </button>

          {/* right side action icons */}
          <div className="absolute right-3 bottom-16 flex flex-col items-center gap-4">
            <div className="flex flex-col items-center gap-1">
              <Heart className="h-6 w-6 fill-red-600 text-red-600" />
              <span className="text-xs font-semibold text-white">1,250</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <MessageCircle className="h-6 w-6 fill-white text-white" />
              <span className="text-xs font-semibold text-white">24</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Send className="h-6 w-6  text-white" />
              <span className="text-xs font-semibold text-white">96</span>
            </div>
            <MoreHorizontal className="h-5 w-5 text-white" />
          </div>

          {/* caption */}
          <div className="absolute bottom-10 left-4 max-w-[75%]">
            <p className="text-2xl font-extrabold uppercase leading-tight text-white">
              IMAGINE. <span className="text-red-500">BUILD.</span>{" "}
              <span className="text-red-500">INNOVATE.</span> REPEAT.
            </p>
          </div>

          {/* progress bar */}
          <div className="absolute inset-x-0 bottom-0 flex items-center gap-2 px-3 pb-2">
            <button
              type="button"
              onClick={toggleReelPlayback}
              aria-label={isReelPlaying ? "Pause" : "Play"}
            >
              {isReelPlaying ? (
                <Pause className="h-3.5 w-3.5 fill-white text-white" />
              ) : (
                <Play className="h-3.5 w-3.5 fill-white text-white" />
              )}
            </button>

            <div
              onClick={handleReelSeek}
              className="group/bar relative h-[3px] flex-1 cursor-pointer rounded-full bg-white/30 py-2 [background-clip:content-box]"
            >
              <div className="pointer-events-none absolute inset-y-0 my-auto h-[3px] w-full rounded-full bg-white/30" />
              <div
                className="pointer-events-none absolute inset-y-0 my-auto h-[3px] rounded-full bg-red-600"
                style={{ width: `${reelProgress}%` }}
              />
              <div
                className="pointer-events-none absolute top-1/2 h-[10px] w-[10px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-600 shadow transition-opacity opacity-0 group-hover/bar:opacity-100"
                style={{ left: `${reelProgress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* TRIAL DIALOG                                                        */}
      {/* ------------------------------------------------------------------ */}

      <Dialog
        open={open}
        onOpenChange={(value) => {
          setOpen(value);

          if (!value) {
            resetScheduleState();
          }
        }}
      >
        <DialogContent className="max-h-[94vh] overflow-y-auto rounded-2xl border-none bg-white p-0 sm:max-w-2xl">
          {/* ================================================================ */}
          {/* MODERN HEADER                                                     */}
          {/* ================================================================ */}

          <DialogHeader className="relative overflow-hidden bg-gradient-to-br from-[#7f1114] via-[#a81b1e] to-[#e4572e] p-6 text-left text-white">
            <div className="pointer-events-none absolute -right-16 -top-20 h-52 w-52 rounded-full bg-white/10 blur-2xl" />

            <div className="pointer-events-none absolute -bottom-20 -left-16 h-48 w-48 rounded-full bg-orange-300/10 blur-3xl" />

            <div className="relative">
              <span className="mb-3 inline-flex w-fit items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide backdrop-blur-sm">
                <CalendarCheck className="h-3.5 w-3.5" />
                Takes under 2 minutes
              </span>

              <DialogTitle className="text-2xl font-bold tracking-tight sm:text-3xl">
                {step === 1 && "Trial registration"}
                {step === 2 && "Pick your slot"}
              </DialogTitle>

              <DialogDescription className="mt-1.5 text-sm leading-relaxed text-white/75">
                {step === 1 &&
                  "Step 1 of 2 — enter your student and location details."}

                {step === 2 &&
                  `Step 2 of 2 — choose a ${modeLabel.toLowerCase()} trial date and time.`}
              </DialogDescription>

              {/* ============================================================ */}
              {/* MODERN STEPPER                                                 */}
              {/* ============================================================ */}

              <div className="mt-6 flex items-center">
                <div className="flex min-w-0 items-center">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold transition-all duration-300 ${
                      step >= 1
                        ? "border-white bg-white text-[#a81b1e] shadow-lg shadow-black/10"
                        : "border-white/40 bg-white/10 text-white/60"
                    }`}
                  >
                    {step > 1 ? <CheckCircle2 className="h-5 w-5" /> : "1"}
                  </div>

                  <div className="ml-2.5 hidden sm:block">
                    <p
                      className={`text-[11px] font-bold tracking-wider transition-colors ${
                        step >= 1 ? "text-white" : "text-white/50"
                      }`}
                    >
                      DETAILS
                    </p>

                    <p className="mt-0.5 text-[10px] text-white/55">
                      Student & location
                    </p>
                  </div>
                </div>

                <div className="mx-3 h-[2px] flex-1 overflow-hidden rounded-full bg-white/20 sm:mx-5">
                  <div
                    className={`h-full rounded-full bg-white transition-all duration-500 ${
                      step >= 2 ? "w-full" : "w-0"
                    }`}
                  />
                </div>

                <div className="flex min-w-0 items-center">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold transition-all duration-300 ${
                      step >= 2
                        ? "border-white bg-white text-[#a81b1e] shadow-lg shadow-black/10"
                        : "border-white/40 bg-white/10 text-white/60"
                    }`}
                  >
                    2
                  </div>

                  <div className="ml-2.5 hidden sm:block">
                    <p
                      className={`text-[11px] font-bold tracking-wider transition-colors ${
                        step >= 2 ? "text-white" : "text-white/50"
                      }`}
                    >
                      SCHEDULE
                    </p>

                    <p className="mt-0.5 text-[10px] text-white/55">
                      Date & time
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between text-[10px] font-medium text-white/55 sm:hidden">
                <span>Student & location</span>
                <span>Date & time</span>
              </div>
            </div>
          </DialogHeader>

          {/* ================================================================ */}
          {/* FORM                                                              */}
          {/* ================================================================ */}

          <form onSubmit={handleSubmit} className="grid gap-6 p-6">
            {/* ============================================================== */}
            {/* STEP 1                                                          */}
            {/* ============================================================== */}

            {step === 1 && (
              <div className="grid gap-5">
                {/* STUDENT DETAILS */}

                <div className="rounded-2xl border border-gray-100 bg-gray-50/60 p-4 sm:p-5">
                  <span className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-50 text-red-700">
                      <UserRound className="h-3.5 w-3.5" />
                    </span>
                    Student details
                  </span>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="grid gap-1.5 text-sm font-medium text-gray-700">
                      Student name
                      <Input
                        required
                        value={form.studentName}
                        onChange={(event) =>
                          updateField("studentName", event.target.value)
                        }
                        className="h-11 border-gray-200 bg-white focus-visible:ring-red-600"
                        placeholder="Child name"
                      />
                      {fieldErrors.studentName && (
                        <span className="text-xs text-red-600">
                          {fieldErrors.studentName}
                        </span>
                      )}
                    </label>

                    <label className="grid gap-1.5 text-sm font-medium text-gray-700">
                      Age
                      <Input
                        required
                        type="number"
                        min={4}
                        max={18}
                        value={form.age}
                        onChange={(event) =>
                          updateField("age", event.target.value)
                        }
                        className="h-11 border-gray-200 bg-white focus-visible:ring-red-600"
                        placeholder="8"
                      />
                      {fieldErrors.age && (
                        <span className="text-xs text-red-600">
                          {fieldErrors.age}
                        </span>
                      )}
                    </label>
                  </div>

                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <label className="grid gap-1.5 text-sm font-medium text-gray-700">
                      Contact number
                      <div className="relative">
                        <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                        <Input
                          required
                          inputMode="numeric"
                          maxLength={10}
                          value={form.contactNumber}
                          onChange={(event) =>
                            updateField(
                              "contactNumber",
                              event.target.value
                                .replace(/\D/g, "")
                                .slice(0, 10),
                            )
                          }
                          className="h-11 border-gray-200 bg-white pl-9 focus-visible:ring-red-600"
                          placeholder="10 digit mobile"
                        />
                      </div>
                      {fieldErrors.contactNumber && (
                        <span className="text-xs text-red-600">
                          {fieldErrors.contactNumber}
                        </span>
                      )}
                    </label>

                    <label className="grid gap-1.5 text-sm font-medium text-gray-700">
                      Email
                      <div className="relative">
                        <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                        <Input
                          required
                          type="email"
                          value={form.email}
                          onChange={(event) =>
                            updateField("email", event.target.value)
                          }
                          className="h-11 border-gray-200 bg-white pl-9 focus-visible:ring-red-600"
                          placeholder="parent@example.com"
                        />
                      </div>
                      {fieldErrors.email && (
                        <span className="text-xs text-red-600">
                          {fieldErrors.email}
                        </span>
                      )}
                    </label>
                  </div>
                </div>

                {/* LOCATION */}

                <div className="rounded-2xl border border-gray-100 bg-gray-50/60 p-4 sm:p-5">
                  <span className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-50 text-red-700">
                      <MapPin className="h-3.5 w-3.5" />
                    </span>
                    Your location
                  </span>

                  <div className="relative">
                    <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                    <Input
                      id="location"
                      name="location"
                      required
                      value={form.location}
                      onChange={(event) =>
                        handleLocationChange(event.target.value)
                      }
                      placeholder="e.g. Kalyani Nagar, Pune"
                      className="h-11 border-gray-200 bg-white pl-9 pr-10 focus-visible:ring-red-600"
                    />

                    {locationLoading && (
                      <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-red-600" />
                    )}
                  </div>

                  {fieldErrors.location && (
                    <span className="mt-1.5 block text-xs text-red-600">
                      {fieldErrors.location}
                    </span>
                  )}

                  {locationVerified && (
                    <div
                      className={`mt-3 rounded-xl border p-3 ${
                        trial === "offline"
                          ? "border-green-200 bg-green-50"
                          : "border-blue-200 bg-blue-50"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                            trial === "offline"
                              ? "bg-green-100 text-green-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {trial === "offline" ? (
                            <MapPin className="h-4 w-4" />
                          ) : (
                            <Wifi className="h-4 w-4" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-medium text-gray-500">
                              Trial mode
                            </span>

                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${
                                trial === "offline"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-blue-100 text-blue-700"
                              }`}
                            >
                              {trial === "offline" ? (
                                <MapPin className="h-3 w-3" />
                              ) : (
                                <Wifi className="h-3 w-3" />
                              )}

                              {modeLabel}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-2 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5">
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />

                        <p className="text-xs font-semibold leading-relaxed text-red-800">
                          {locationMessage}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* CONTINUE-AFTER-TRIAL CENTER */}

                <div className="rounded-2xl border border-gray-100 bg-gray-50/60 p-4 sm:p-5">
                  <span className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-50 text-red-700">
                      <MapPin className="h-3.5 w-3.5" />
                    </span>
                    Continue classes after the trial
                  </span>

                  <p className="mb-3 text-xs leading-relaxed text-gray-500">
                    The trial itself happens at our headquarters. Which center
                    would you like to continue at afterwards?
                  </p>

                  <div className="grid gap-2 sm:grid-cols-3">
                    {CONTINUE_CENTERS.map((center) => {
                      const checked = preferredCenter === center.id;

                      return (
                        <label
                          key={center.id}
                          className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition ${
                            checked
                              ? "border-red-700 bg-red-50 text-red-800"
                              : "border-gray-200 bg-white text-gray-700 hover:border-red-200 hover:bg-red-50/40"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() =>
                              handlePreferredCenterToggle(center.id)
                            }
                            className="h-4 w-4 shrink-0 rounded border-gray-300 text-red-700 focus:ring-red-600"
                          />
                          {center.label}
                        </label>
                      );
                    })}
                  </div>

                  {preferredCenterError && (
                    <span className="mt-2 block text-xs text-red-600">
                      {preferredCenterError}
                    </span>
                  )}
                </div>

                {/* NOTICE */}

                {notice && (
                  <div
                    role="status"
                    className={`flex items-start gap-2 rounded-md p-3 text-sm ${
                      notice.type === "success"
                        ? "bg-green-50 text-green-800"
                        : "bg-red-50 text-red-800"
                    }`}
                  >
                    {notice.type === "success" ? (
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                    ) : (
                      <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    )}

                    {notice.message}
                  </div>
                )}

                {/* NEXT BUTTON */}

                <Button
                  type="button"
                  onClick={handleNextFromStep1}
                  disabled={savingLead || locationLoading}
                  className="h-12 rounded-full bg-[#a81b1e] text-white shadow-[0_6px_18px_-4px_rgba(168,27,30,0.55)] transition hover:-translate-y-0.5 hover:bg-[#8f1518]"
                >
                  {locationLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Finding nearest center...
                    </>
                  ) : savingLead ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : preferredCenter && preferredCenter !== "kalyani-nagar" ? (
                    <>
                      Confirm registration
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  ) : (
                    <>
                      Next: pick a slot
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* ============================================================== */}
            {/* STEP 2                                                          */}
            {/* ============================================================== */}

            {step === 2 && (
              <div className="grid gap-4">
                {/* MODE SUMMARY */}

                <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3">
                  <div className="flex items-center gap-3">
                    {trial === "offline" ? (
                      <MapPin className="h-5 w-5 text-green-700" />
                    ) : (
                      <Wifi className="h-5 w-5 text-blue-700" />
                    )}

                    <div>
                      <p className="text-xs text-gray-500">Trial mode</p>

                      <p className="text-sm font-bold text-gray-900">
                        {modeLabel}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-gray-500">Location</p>

                    <p className="text-sm font-semibold text-gray-900">
                      {locationLabel}
                    </p>
                  </div>
                </div>

                {/* SCHEDULE LABEL */}

                <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-400">
                  <CalendarCheck className="h-3.5 w-3.5 text-red-700" />
                  Schedule
                </span>

                {/* CALENDAR + SLOTS */}

                <div className="grid gap-4 sm:grid-cols-[auto_1fr] sm:items-start">
                  <div className="flex justify-center rounded-xl border border-gray-200 p-2">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => {
                        if (!date || Number.isNaN(date.getTime())) {
                          setSelectedDate(undefined);
                          setSelectedTime(null);
                          return;
                        }

                        setSelectedDate(date);
                        setSelectedTime(null);
                        setNotice(null);
                      }}
                      disabled={isDateDisabledForMode}
                      defaultMonth={minBookableDate}
                      className="rounded-md"
                    />
                  </div>

                  <div className="grid gap-2">
                    <span className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                      <Clock3 className="h-3.5 w-3.5 text-red-700" />
                      Select time
                    </span>

                    {selectedDate ? (
                      activeSlots.length ? (
                        <div className="flex flex-wrap gap-2">
                          {activeSlots.map((time) => (
                            <button
                              key={time}
                              type="button"
                              onClick={() => {
                                setSelectedTime(time);
                                setNotice(null);
                              }}
                              className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${
                                selectedTime === time
                                  ? "border-red-700 bg-red-700 text-white"
                                  : "border-gray-200 bg-white text-gray-700 hover:border-red-200 hover:bg-red-50"
                              }`}
                            >
                              {time}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-400">
                          No slots available for this mode.
                        </p>
                      )
                    ) : (
                      <p className="text-xs text-gray-400">
                        Pick a date to see available time slots.
                      </p>
                    )}
                  </div>
                </div>

                {/* NOTICE */}

                {notice && (
                  <div
                    role="status"
                    className={`flex items-start gap-2 rounded-md p-3 text-sm ${
                      notice.type === "success"
                        ? "bg-green-50 text-green-800"
                        : "bg-red-50 text-red-800"
                    }`}
                  >
                    {notice.type === "success" ? (
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                    ) : (
                      <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    )}

                    {notice.message}
                  </div>
                )}

                {/* ACTIONS */}

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBack}
                    className="h-12 flex-1 rounded-full"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>

                  <Button
                    type="submit"
                    disabled={submitting || !selectedDate || !selectedTime}
                    className="h-12 flex-[2] rounded-full bg-[#a81b1e] text-white hover:bg-[#8f1518]"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Submit registration"
                    )}
                  </Button>
                </div>
              </div>
            )}
          </form>
        </DialogContent>
      </Dialog>

      {/* ------------------------------------------------------------------ */}
      {/* SUCCESS MODAL                                                       */}
      {/* ------------------------------------------------------------------ */}

      <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
        <DialogContent className="max-w-sm overflow-hidden rounded-2xl border-none bg-white p-0 text-center">
          <div className="flex flex-col items-center gap-4 px-6 pb-6 pt-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
              <CheckCircle2 className="h-9 w-9 text-green-600" />
            </div>

            <div>
              <DialogTitle className="text-xl font-bold text-gray-900">
                Trial booked!
              </DialogTitle>

              <DialogDescription className="mt-2 text-sm leading-relaxed text-gray-600">
                {successMessage}
              </DialogDescription>
            </div>

            <Button
              type="button"
              onClick={() => setSuccessOpen(false)}
              className="h-11 w-full rounded-full bg-[#a81b1e] text-white hover:bg-[#8f1518]"
            >
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default HeroSection;
