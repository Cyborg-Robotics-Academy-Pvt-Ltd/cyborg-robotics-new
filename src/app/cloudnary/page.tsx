"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, RefreshCw, Trash2, Video, AlertTriangle } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

type Media = {
  publicId: string;
  resourceType: "image" | "video";
  format?: string;
  bytes?: number;
  createdAt?: string;
  secureUrl: string;
  duration?: number;
};

const formatBytes = (bytes = 0) =>
  bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(2)} MB` : `${(bytes / 1024).toFixed(1)} KB`;

export default function CloudinaryMediaPage() {
  const { user, userRole, loading: authLoading } = useAuth();
  const [videos, setVideos] = useState<Media[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadVideos = useCallback(async (cursor?: string, append = false) => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const token = await user.getIdToken();
      const params = new URLSearchParams({ resource_type: "video" });
      if (cursor) params.set("next_cursor", cursor);
      const response = await fetch(`/api/cloudinary-media?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to load Cloudinary media");
      setVideos((current) => append ? [...current, ...data.resources] : data.resources);
      setNextCursor(data.nextCursor);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to load Cloudinary media");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user && userRole === "admin") loadVideos();
  }, [loadVideos, user, userRole]);

  const deleteVideo = async (video: Media) => {
    if (!user || !window.confirm(`Permanently delete “${video.publicId}”? This cannot be undone.`)) return;
    setDeleting(video.publicId);
    setError(null);
    try {
      const token = await user.getIdToken();
      const response = await fetch("/api/cloudinary-media", {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ publicId: video.publicId, resourceType: video.resourceType }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to delete video");
      setVideos((current) => current.filter((item) => item.publicId !== video.publicId));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to delete video");
    } finally {
      setDeleting(null);
    }
  };

  if (authLoading) return <main className="grid min-h-screen place-items-center"><Loader2 className="animate-spin" /></main>;
  if (!user || userRole !== "admin") return <main className="grid min-h-screen place-items-center p-6 text-center"><p>Administrator access is required to manage Cloudinary media.</p></main>;

  return (
    <main className="min-h-screen bg-slate-50 p-5 text-slate-900 md:p-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Cloudinary video cleanup</h1>
            <p className="mt-1 text-slate-600">Review uploaded videos and permanently remove ones you no longer need.</p>
          </div>
          <button onClick={() => loadVideos()} disabled={loading} className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 font-medium text-white disabled:opacity-50">
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
        </div>
        <div className="mb-6 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-950">
          <AlertTriangle className="mt-0.5 shrink-0" size={19} /><p>Deletion is permanent. Check whether a video is used on the site before removing it; its delivery URL will stop working.</p>
        </div>
        {error && <p className="mb-5 rounded-lg bg-red-50 p-4 text-red-700">{error}</p>}
        {loading && videos.length === 0 ? <div className="grid place-items-center py-24"><Loader2 className="animate-spin" /></div> : (
          <>
            <p className="mb-4 text-sm text-slate-600">Showing {videos.length} uploaded video{videos.length === 1 ? "" : "s"}.</p>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {videos.map((video) => <article key={video.publicId} className="overflow-hidden rounded-xl border bg-white shadow-sm">
                <video controls preload="metadata" className="aspect-video w-full bg-black" src={video.secureUrl} />
                <div className="space-y-3 p-4">
                  <p className="break-all font-medium" title={video.publicId}>{video.publicId}</p>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-slate-600"><span>{formatBytes(video.bytes)}</span>{video.duration !== undefined && <span>{Math.round(video.duration)} sec</span>}<span>{video.format?.toUpperCase()}</span></div>
                  <button onClick={() => deleteVideo(video)} disabled={deleting === video.publicId} className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-3 py-2 font-medium text-white hover:bg-red-700 disabled:opacity-50">
                    {deleting === video.publicId ? <Loader2 size={17} className="animate-spin" /> : <Trash2 size={17} />} Delete permanently
                  </button>
                </div>
              </article>)}
            </div>
            {!loading && videos.length === 0 && <div className="py-20 text-center text-slate-500"><Video className="mx-auto mb-3" />No uploaded videos found.</div>}
            {nextCursor && <div className="mt-8 text-center"><button onClick={() => loadVideos(nextCursor, true)} className="rounded-lg border border-slate-300 bg-white px-4 py-2 font-medium">Load next 100 videos</button></div>}
          </>
        )}
      </div>
    </main>
  );
}
