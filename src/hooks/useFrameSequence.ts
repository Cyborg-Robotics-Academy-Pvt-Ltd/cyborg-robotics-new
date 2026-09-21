import { useEffect, useRef, useState, useCallback } from 'react';

interface UseFrameSequenceOptions {
  frameCount: number;
  getFrameUrl: (index: number) => string;
  concurrency?: number; // parallel decode batch size
  enabled?: boolean;
}

interface FrameSequenceState {
  images: (HTMLImageElement | null)[];
  loadedCount: number;
  isReady: boolean; // true once first frame is decoded (unblocks render)
  isFullyLoaded: boolean;
}

export function useFrameSequence({
  frameCount,
  getFrameUrl,
  concurrency = 4,
  enabled = true,
}: UseFrameSequenceOptions) {
  const imagesRef = useRef<(HTMLImageElement | null)[]>(new Array(frameCount).fill(null));
  const [state, setState] = useState<FrameSequenceState>({
    images: imagesRef.current,
    loadedCount: 0,
    isReady: false,
    isFullyLoaded: false,
  });

  const loadFrame = useCallback((index: number): Promise<void> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.decoding = 'async';
      img.src = getFrameUrl(index);

      img.onload = async () => {
        try {
          // Decode off main thread â€” avoids jank on first paint of each frame
          if ('decode' in img) {
            await img.decode();
          }
        } catch {
          // decode() can reject on some browsers/edge cases; image is still usable
        }
        imagesRef.current[index] = img;
        resolve();
      };

      img.onerror = () => {
        // Don't block the whole sequence on one bad frame
        resolve();
      };
    });
  }, [getFrameUrl]);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;

    async function loadAll() {
      // Load frame 0 first and synchronously unblock render
      await loadFrame(0);
      if (cancelled) return;
      setState((s) => ({ ...s, loadedCount: 1, isReady: true, images: imagesRef.current }));

      // Then load the rest in small concurrent batches, in order,
      // so early scroll positions resolve before later ones.
      const remaining = Array.from({ length: frameCount - 1 }, (_, i) => i + 1);

      for (let i = 0; i < remaining.length; i += concurrency) {
        if (cancelled) return;
        const batch = remaining.slice(i, i + concurrency);
        await Promise.all(batch.map(loadFrame));
        if (cancelled) return;
        setState((s) => ({
          ...s,
          loadedCount: Math.min(s.loadedCount + batch.length, frameCount),
          images: imagesRef.current,
        }));
      }

      if (!cancelled) {
        setState((s) => ({ ...s, isFullyLoaded: true }));
      }
    }

    loadAll();
    return () => {
      cancelled = true;
    };
  }, [frameCount, loadFrame, concurrency, enabled]);

  return state;
}
