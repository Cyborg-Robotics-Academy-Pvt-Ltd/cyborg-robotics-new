"use client";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import AuthLoadingSpinner from "@/components/AuthLoadingSpinner";
import Image from "next/image";
import {
  Mail,
  Phone,
  Calendar,
  Award,
  Edit,
  Save,
  X,
  Camera,
  Hash,
  Activity,
  type LucideIcon,
} from "lucide-react";
import HangingIdCard from "@/components/lightswind/hanging-id-card";

/* ───────────────────────── Types & constants ───────────────────────── */

interface ProfileData {
  username?: string;
  name?: string;
  phoneNumber?: string;
  PrnNumber?: string;
  status?: string;
  superAdmin?: boolean;
  profileimage?: string;
  imageUrl?: string;
  imageUrls?: string[];
}

interface Notice {
  type: "success" | "error";
  text: string;
}

const COLLECTIONS: Record<string, string> = {
  admin: "admins",
  trainer: "trainers",
  student: "students",
};
const getCollectionName = (role: string) => COLLECTIONS[role] ?? "students";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_USERNAME_LENGTH = 40;

const BRAND = { red: "#A81B1E", navy: "#062341", blue: "#0855AB" } as const;

const ROLE_STYLES: Record<string, { bg: string; fg: string }> = {
  admin: { bg: "rgba(168,27,30,0.09)", fg: BRAND.red },
  trainer: { bg: "rgba(8,85,171,0.09)", fg: BRAND.blue },
  student: { bg: "rgba(6,35,65,0.08)", fg: BRAND.navy },
};

const STATUS_STYLES: Record<string, string> = {
  active: "bg-green-50 text-green-700 ring-green-200",
  inactive: "bg-red-50 text-red-700 ring-red-200",
};
const STATUS_FALLBACK = "bg-yellow-50 text-yellow-700 ring-yellow-200";

const SYNE = { fontFamily: "'Syne', sans-serif" } as const;

/* ───────────────────────── Small presentational pieces ───────────────────────── */

/** Faint circuit-trace artwork for the header. Decorative only. */
const CircuitPattern = () => (
  <svg
    aria-hidden="true"
    focusable="false"
    className="pointer-events-none absolute inset-0 h-full w-full"
    viewBox="0 0 320 130"
    preserveAspectRatio="xMidYMid slice"
    fill="none"
    stroke="white"
    strokeWidth="1"
    strokeLinecap="round"
    strokeLinejoin="round"
    opacity="0.16"
  >
    <path d="M0 96h58l14-14h48l12 12h70" />
    <path d="M320 28h-52l-16 16h-40l-10-10h-46" />
    <path d="M214 130v-24l14-14h56l12-12h24" />
    <path d="M24 0v26l12 12h38" />
    <circle cx="58" cy="96" r="3" />
    <circle cx="190" cy="94" r="3" />
    <circle cx="268" cy="28" r="3" />
    <circle cx="74" cy="38" r="3" />
    <circle cx="296" cy="80" r="3" />
    <rect x="120" y="14" width="22" height="14" rx="2" />
    <rect x="150" y="14" width="22" height="14" rx="2" />
  </svg>
);

/** Deterministic, decorative barcode derived from the user's uid. */
const Barcode = ({ seed }: { seed: string }) => {
  const { bars, total } = useMemo(() => {
    let h = 2166136261;
    for (let i = 0; i < seed.length; i++) {
      h ^= seed.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    let x = 0;
    const out: { x: number; w: number }[] = [];
    for (let i = 0; i < 44; i++) {
      h = Math.imul(h ^ (h >>> 15), 2246822507);
      h ^= h >>> 13;
      const w = 1 + (Math.abs(h) % 3);
      if (i % 2 === 0) out.push({ x, w });
      x += w;
    }
    return { bars: out, total: x };
  }, [seed]);

  return (
    <svg
      aria-hidden="true"
      focusable="false"
      className="h-8 w-full"
      viewBox={`0 0 ${total} 28`}
      preserveAspectRatio="none"
      fill={BRAND.navy}
    >
      {bars.map((b) => (
        <rect key={b.x} x={b.x} y={0} width={b.w} height={28} />
      ))}
    </svg>
  );
};

interface InfoRowProps {
  icon: LucideIcon;
  tint: string;
  color: string;
  label: string;
  children: React.ReactNode;
}

const InfoRow = ({
  icon: Icon,
  tint,
  color,
  label,
  children,
}: InfoRowProps) => (
  <div className="flex items-center gap-3 py-2.5">
    <span
      aria-hidden="true"
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
      style={{ background: tint }}
    >
      <Icon className="h-4 w-4" style={{ color }} />
    </span>
    <div className="min-w-0 flex-1">
      <dt className="text-[11px] font-medium leading-none text-slate-500">
        {label}
      </dt>
      <dd className="mt-1 truncate text-[13px] font-medium leading-tight text-slate-900">
        {children}
      </dd>
    </div>
  </div>
);

/* ───────────────────────── Component ───────────────────────── */

const UserProfile = () => {
  const { user: authUser, userRole, loading: authLoading } = useAuth();
  const router = useRouter();
  const role: string = userRole ?? "";

  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [editedUsername, setEditedUsername] = useState("");
  const [saving, setSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showProfilePreview, setShowProfilePreview] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);
  const closePreviewRef = useRef<HTMLButtonElement>(null);

  /* Fetch profile */
  useEffect(() => {
    if (authLoading) return;
    if (!authUser) {
      router.push("/login");
      return;
    }

    let cancelled = false;
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        const snap = await getDoc(
          doc(db, getCollectionName(role), authUser.uid),
        );
        if (cancelled) return;
        if (snap.exists()) {
          const data = snap.data() as ProfileData;
          setProfileData(data);
          setEditedUsername(data.username || "");
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchProfileData();
    return () => {
      cancelled = true;
    };
  }, [authUser, role, authLoading, router]);

  /* Auto-dismiss notices */
  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(null), 4000);
    return () => clearTimeout(t);
  }, [notice]);

  /* Preview modal: Escape to close + focus management */
  useEffect(() => {
    if (!showProfilePreview) return;
    closePreviewRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowProfilePreview(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showProfilePreview]);

  const cancelEdit = useCallback(() => {
    setIsEditingUsername(false);
    setEditedUsername(profileData?.username || "");
  }, [profileData?.username]);

  const handleSaveUsername = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const next = editedUsername.trim();
    if (!authUser || !role || !next) return;
    try {
      setSaving(true);
      await updateDoc(doc(db, getCollectionName(role), authUser.uid), {
        username: next,
      });
      setProfileData((prev) => ({ ...(prev ?? {}), username: next }));
      setIsEditingUsername(false);
      setNotice({ type: "success", text: "Username updated." });
    } catch (error) {
      console.error("Error updating username:", error);
      setNotice({
        type: "error",
        text: "Couldn't update your username. Try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleProfilePictureUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const input = e.target;
    const file = input.files?.[0];
    if (!file || !authUser) return;

    if (!file.type.startsWith("image/")) {
      setNotice({ type: "error", text: "Choose an image file." });
      input.value = "";
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setNotice({ type: "error", text: "Image must be 5 MB or smaller." });
      input.value = "";
      return;
    }

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("userId", authUser.uid);
      formData.append("userType", role || "student");
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (!response.ok || !data.imageUrl)
        throw new Error(data.error || "Failed to upload image");
      await updateDoc(doc(db, getCollectionName(role), authUser.uid), {
        profileimage: data.imageUrl,
      });
      setProfileData((prev) => ({
        ...(prev ?? {}),
        profileimage: data.imageUrl,
      }));
      setNotice({ type: "success", text: "Profile photo updated." });
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      setNotice({
        type: "error",
        text: "Couldn't upload your photo. Try again.",
      });
    } finally {
      setIsUploading(false);
      input.value = "";
    }
  };

  if (authLoading || loading) return <AuthLoadingSpinner />;
  if (!authUser) return null;

  /* ── Derived values ── */
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getDisplayName = () => {
    if (profileData?.username?.trim()) return profileData.username.trim();
    if (profileData?.name?.trim()) return profileData.name.trim();
    if (authUser.displayName?.trim()) return authUser.displayName.trim();
    if (authUser.email) {
      const emailName = authUser.email.split("@")[0];
      return emailName.charAt(0).toUpperCase() + emailName.slice(1);
    }
    return "User";
  };

  const displayName = getDisplayName();
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const profileImageSrc =
    profileData?.profileimage ||
    profileData?.imageUrl ||
    (Array.isArray(profileData?.imageUrls) ? profileData.imageUrls[0] : null);

  const roleLabel = profileData?.superAdmin
    ? "Super admin"
    : role
      ? role.charAt(0).toUpperCase() + role.slice(1)
      : "Member";
  const roleStyle = ROLE_STYLES[role] ?? ROLE_STYLES.student;

  const status = profileData?.status;
  const statusClass = status ? (STATUS_STYLES[status] ?? STATUS_FALLBACK) : "";

  const idCode = authUser.uid.slice(0, 10).toUpperCase();

  /* ── Render ── */
  return (
    <div
      className="flex min-h-full items-center justify-center bg-gradient-to-b from-slate-50 via-white to-red-50/40 p-4 pt-2"
      style={{
        backgroundImage:
          "radial-gradient(rgba(15,23,42,0.045) 1px, transparent 1px)",
        backgroundSize: "18px 18px",
      }}
    >
      <HangingIdCard
        ropeLength={100}
        ropeColor={BRAND.red}
        accentColor={BRAND.red}
        className="w-full max-w-xs drop-shadow-[0_24px_32px_rgba(15,23,42,0.18)]"
      >
        <div className="overflow-hidden rounded-2xl border border-white bg-white ring-1 ring-slate-900/5">
          {/* ── Header ── */}
          <div
            className="relative overflow-hidden px-5 pb-12 pt-5"
            style={{
              background:
                "linear-gradient(135deg, #7f1018 0%, #A81B1E 58%, #c02b31 100%)",
            }}
          >
            <CircuitPattern />
            <div className="relative flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white p-1.5 shadow-lg shadow-black/15">
                <Image
                  src="/assets/Cyborg-logo.png"
                  alt="Cyborg Robotics logo"
                  width={44}
                  height={44}
                  className="h-full w-full object-contain"
                  unoptimized
                />
              </div>
              <div className="min-w-0">
                <p
                  className="text-[14px] font-bold leading-tight tracking-wide text-white"
                  style={SYNE}
                >
                  Cyborg Robotics
                </p>
                <p className="mt-0.5 text-[11px] font-medium text-white/80">
                  Official member card
                </p>
              </div>
            </div>
          </div>

          {/* ── Avatar ── */}
          <div className="-mt-10 flex justify-center">
            <div className="relative h-[88px] w-[88px] rounded-full bg-white p-1 shadow-lg shadow-slate-900/15 ring-1 ring-slate-200">
              {/* Input comes first so sibling labels can react to its focus */}
              <input
                id="profile-picture-upload"
                type="file"
                accept="image/*"
                onChange={handleProfilePictureUpload}
                onClick={(e) => e.stopPropagation()}
                className="peer sr-only"
                disabled={isUploading}
              />

              {profileImageSrc ? (
                <button
                  type="button"
                  onClick={(e) => {
                    // Keep the click from reaching HangingIdCard's physics impulse
                    e.stopPropagation();
                    setShowProfilePreview(true);
                  }}
                  className="block h-full w-full rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0855AB] focus-visible:ring-offset-2"
                  aria-label="View profile photo"
                >
                  <Image
                    src={profileImageSrc}
                    alt={displayName}
                    width={80}
                    height={80}
                    className="h-full w-full rounded-full object-cover"
                    unoptimized
                  />
                </button>
              ) : (
                <label
                  htmlFor="profile-picture-upload"
                  onClick={(e) => e.stopPropagation()}
                  className="flex h-full w-full cursor-pointer items-center justify-center rounded-full text-[22px] font-bold text-white peer-focus-visible:ring-2 peer-focus-visible:ring-[#0855AB] peer-focus-visible:ring-offset-2"
                  style={{ background: BRAND.navy, ...SYNE }}
                >
                  <span aria-hidden="true">{initials}</span>
                  <span className="sr-only">Upload profile photo</span>
                </label>
              )}

              {/* Camera button */}
              <label
                htmlFor="profile-picture-upload"
                onClick={(e) => e.stopPropagation()}
                className="absolute bottom-0 right-0 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border-2 border-white text-white transition-transform hover:scale-105 peer-focus-visible:ring-2 peer-focus-visible:ring-[#0855AB] peer-focus-visible:ring-offset-2 peer-disabled:cursor-not-allowed peer-disabled:opacity-60"
                style={{ background: BRAND.navy }}
              >
                <Camera className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="sr-only">Change profile photo</span>
              </label>

              {/* Upload overlay */}
              {isUploading && (
                <div
                  role="status"
                  className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50"
                >
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span className="sr-only">Uploading photo</span>
                </div>
              )}
            </div>
          </div>

          {/* ── Name & role ── */}
          <div className="px-5">
            {isEditingUsername ? (
              <form
                onSubmit={handleSaveUsername}
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => {
                  if (e.key === "Escape") cancelEdit();
                }}
                className="flex flex-col items-center gap-3 py-3"
              >
                <label htmlFor="username-input" className="sr-only">
                  Username
                </label>
                <input
                  id="username-input"
                  type="text"
                  value={editedUsername}
                  onChange={(e) => setEditedUsername(e.target.value)}
                  maxLength={MAX_USERNAME_LENGTH}
                  autoComplete="nickname"
                  autoFocus
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-center text-base font-bold focus:outline-none focus:ring-2 focus:ring-[#0855AB]"
                  style={SYNE}
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={saving || !editedUsername.trim()}
                    className="flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-green-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2 disabled:opacity-50"
                  >
                    <Save className="h-3.5 w-3.5" aria-hidden="true" />
                    {saving ? "Saving…" : "Save"}
                  </button>
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
                  >
                    <X className="h-3.5 w-3.5" aria-hidden="true" />
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex items-center justify-center gap-2 pb-1 pt-3">
                <h2
                  className="min-w-0 break-words text-center text-xl font-bold leading-tight text-slate-900"
                  style={SYNE}
                >
                  {displayName}
                </h2>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditingUsername(true);
                  }}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-colors hover:bg-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0855AB] focus-visible:ring-offset-2"
                  aria-label="Edit username"
                >
                  <Edit className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>
            )}

            <div className="flex justify-center pb-3 pt-1">
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
                style={{ background: roleStyle.bg, color: roleStyle.fg }}
              >
                <Award className="h-3.5 w-3.5" aria-hidden="true" />
                {roleLabel}
              </span>
            </div>
          </div>

          {/* ── Details ── */}
          <dl className="mx-4 divide-y divide-slate-100 border-y border-slate-100">
            <InfoRow
              icon={Mail}
              tint="rgba(8,85,171,0.09)"
              color={BRAND.blue}
              label="Email"
            >
              <span title={authUser.email ?? undefined}>{authUser.email}</span>
            </InfoRow>

            {profileData?.phoneNumber && (
              <InfoRow
                icon={Phone}
                tint="rgba(22,163,74,0.09)"
                color="#16a34a"
                label="Phone"
              >
                {profileData.phoneNumber}
              </InfoRow>
            )}

            <InfoRow
              icon={Calendar}
              tint="rgba(124,58,237,0.09)"
              color="#7c3aed"
              label="Member since"
            >
              {formatDate(authUser.metadata?.creationTime)}
            </InfoRow>

            {profileData?.PrnNumber && (
              <InfoRow
                icon={Hash}
                tint="rgba(6,148,162,0.09)"
                color="#0891b2"
                label="PRN number"
              >
                {profileData.PrnNumber}
              </InfoRow>
            )}

            {status && (
              <InfoRow
                icon={Activity}
                tint="rgba(124,58,237,0.09)"
                color="#7c3aed"
                label="Status"
              >
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ${statusClass}`}
                >
                  <span
                    aria-hidden="true"
                    className="h-1.5 w-1.5 rounded-full bg-current"
                  />
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </span>
              </InfoRow>
            )}
          </dl>

          {/* ── Footer ── */}
          <div
            className="flex items-center justify-between gap-2 px-4 py-3"
            style={{ background: BRAND.red }}
          >
            <p className="text-[11px] font-medium text-white/85">
              Robotics, innovation, learning
            </p>
            <p className="shrink-0 text-[11px] font-semibold tracking-wide text-white">
              cyborgrobotics.in
            </p>
          </div>
        </div>
      </HangingIdCard>

      {/* ── Toast ── */}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed bottom-4 left-1/2 z-40 -translate-x-1/2 px-4"
      >
        {notice && (
          <p
            className={`rounded-full px-4 py-2 text-sm font-medium text-white shadow-lg ${
              notice.type === "success" ? "bg-slate-900" : "bg-red-700"
            }`}
          >
            {notice.text}
          </p>
        )}
      </div>

      {/* ── Profile preview modal (fixed overlay, outside the card) ── */}
      {showProfilePreview && profileImageSrc && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={() => setShowProfilePreview(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`${displayName}'s profile photo`}
            className="relative w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              ref={closePreviewRef}
              type="button"
              onClick={() => setShowProfilePreview(false)}
              className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/80 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              aria-label="Close preview"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
            <Image
              src={profileImageSrc}
              alt={displayName}
              width={600}
              height={600}
              className="h-auto w-full object-cover"
              unoptimized
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
