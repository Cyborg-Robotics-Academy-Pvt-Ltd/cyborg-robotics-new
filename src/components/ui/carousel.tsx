"use client";
import { IconArrowNarrowRight, IconArrowNarrowLeft } from "@tabler/icons-react";
import { Pause, Play } from "lucide-react";
import Image from "next/image";
import { useState, useRef, useId, useEffect } from "react";

interface SlideData {
  imageUrl?: string;
  videoUrl?: string;
}

interface SlideProps {
  slide: SlideData;
  index: number;
  current: number;
  handleSlideClick: (index: number) => void;
}

const Slide = ({ slide, index, current, handleSlideClick }: SlideProps) => {
  const slideRef = useRef<HTMLLIElement>(null);
  const xRef = useRef(0);
  const yRef = useRef(0);
  const frameRef = useRef<number | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const animate = () => {
      if (!slideRef.current) return;

      const x = xRef.current;
      const y = yRef.current;

      slideRef.current.style.setProperty("--x", `${x}px`);
      slideRef.current.style.setProperty("--y", `${y}px`);

      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (videoRef.current) {
      if (current !== index && isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
    // Add 'index' and 'isPlaying' to the dependency array
  }, [current, index, isPlaying]);

  const handleMouseMove = (event: React.MouseEvent) => {
    const el = slideRef.current;
    if (!el) return;

    const r = el.getBoundingClientRect();
    xRef.current = event.clientX - (r.left + Math.floor(r.width / 2));
    yRef.current = event.clientY - (r.top + Math.floor(r.height / 2));
  };

  const handleMouseLeave = () => {
    xRef.current = 0;
    yRef.current = 0;
  };

  const imageLoaded = (event: React.SyntheticEvent<HTMLImageElement>) => {
    event.currentTarget.style.opacity = "1";
  };

  const handlePlayPauseClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current
          .play()
          .then(() => setIsPlaying(true))
          .catch((error) => console.error("Playback failed:", error));
      }
    }
  };

  const handleSlideClickEvent = (e: React.MouseEvent) => {
    if (!(e.target instanceof Element && e.target.closest("button"))) {
      handleSlideClick(index);
    }
  };

  const { imageUrl, videoUrl } = slide;

  return (
    <div className="[perspective:1200px] [transform-style:preserve-3d] my-3">
      <li
        ref={slideRef}
        className="flex flex-1 flex-col items-center justify-center relative text-center text-white opacity-100 transition-all duration-300 ease-in-out w-[60vw] h-[60vw] sm:w-[40vmin] sm:h-[40vmin] mx-[2vmin] z-10"
        onClick={handleSlideClickEvent}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transform:
            current !== index
              ? "scale(0.98) rotateX(8deg)"
              : "scale(1) rotateX(0deg)",
          transition: "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
          transformOrigin: "bottom",
        }}
      >
        <div
          className="absolute top-0 left-0 w-full h-full bg-[#1D1F2F] rounded-[4%] overflow-hidden transition-all duration-150 ease-out"
          style={{
            transform:
              current === index
                ? "translate3d(calc(var(--x) / 30), calc(var(--y) / 30), 0)"
                : "none",
          }}
        >
          {imageUrl ? (
            <Image
              className="absolute inset-0 w-full h-full object-cover transition-opacity duration-600 ease-in-out"
              style={{ opacity: 1 }}
              alt=""
              src={imageUrl}
              onLoad={imageLoaded}
              loading="eager"
              layout="fill"
              objectFit="cover"
              priority={true}
              sizes="(max-width: 640px) 50vw, 30vmin"
            />
          ) : videoUrl ? (
            <video
              ref={videoRef}
              className="absolute inset-0 w-full h-full object-cover transition-opacity duration-600 ease-in-out"
              style={{ opacity: 1 }}
              src={videoUrl}
              loop
            />
          ) : null}
        </div>

        {videoUrl && current === index && (
          <button
            onClick={handlePlayPauseClick}
            className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-red-800 text-black rounded-full p-2"
            title={isPlaying ? "Pause Video" : "Play Video"}
          >
            {isPlaying ? <Pause color="white" /> : <Play color="white" />}
          </button>
        )}

        <article
          className={`relative p-[2vmin] transition-opacity duration-1000 ease-in-out ${
            current === index ? "opacity-100 visible" : "opacity-0 invisible"
          }`}
        >
          <div className="flex justify-center my-4"></div>
        </article>
      </li>
    </div>
  );
};

interface CarouselProps {
  slides: SlideData[];
}

export function Carousel({ slides }: CarouselProps) {
  const [current, setCurrent] = useState(0);

  const handlePreviousClick = () => {
    const previous = current - 1;
    setCurrent(previous < 0 ? slides.length - 1 : previous);
  };

  const handleNextClick = () => {
    const next = current + 1;
    setCurrent(next === slides.length ? 0 : next);
  };

  const handleSlideClick = (index: number) => {
    if (current !== index) {
      setCurrent(index);
    }
  };

  const id = useId();

  return (
    <div
      className="relative w-[60vw] h-[60vw] sm:w-[40vmin] sm:h-[40vmin] ml-40"
      aria-labelledby={`carousel-heading-${id}`}
    >
      <ul
        className="absolute flex mx-[-30vmin] lg:mx-[-10vmin] transition-transform duration-1000 ease-in-out"
        style={{
          transform: `translateX(-${current * (100 / slides.length)}%)`,
        }}
      >
        {slides.map((slide, index) => (
          <Slide
            key={index}
            slide={slide}
            index={index}
            current={current}
            handleSlideClick={handleSlideClick}
          />
        ))}
      </ul>

      <div className="absolute flex w-full top-[calc(100%+1rem)] my-3 justify-center">
        <div className="flex justify-end gap-2 lg:mr-10 mr-44">
          <button
            className="relative z-40 h-10 w-10 rounded-full shadow-xl bg-gray-100 flex items-center justify-center disabled:opacity-50"
            onClick={handlePreviousClick}
            disabled={current === 0}
          >
            <IconArrowNarrowLeft className="h-6 w-6 text-gray-500" />
          </button>
          <button
            className="relative z-40 h-10 w-10 rounded-full shadow-xl bg-gray-100 flex items-center justify-center disabled:opacity-50"
            onClick={handleNextClick}
            disabled={current === slides.length - 1}
          >
            <IconArrowNarrowRight className="h-6 w-6 text-gray-500" />
          </button>
        </div>
      </div>
    </div>
  );
}
