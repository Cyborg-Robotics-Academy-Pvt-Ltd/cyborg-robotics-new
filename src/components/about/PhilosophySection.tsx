"use client";

import { Suspense, useMemo, lazy } from "react";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";

// Lazy load the AnimatedTestimonials component
const AnimatedTestimonials = lazy(() =>
  import("@/components/ui/animated-testimonials").then((module) => ({
    default: module.AnimatedTestimonials,
  }))
);

export default function PhilosophySection() {
  const testimonials = useMemo(
    () => [
      {
        quote:
          "At Cyborg Robotics Academy, we believe every child has the potential to be an innovator. Our hands-on approach transforms curiosity into confidence, ideas into reality.",
        src: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=500&fit=crop&q=75",
      },
      {
        quote:
          "We don't just teach robotics – we build future leaders. Through practical experience and mentorship, students discover their ability to solve real-world problems.",
        src: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=500&fit=crop&q=75",
      },
      {
        quote:
          "Our mission is to create an environment where innovation thrives. Every project, every experiment, every success builds toward a future where our students lead the way.",
        src: "https://images.unsplash.com/photo-1518314916381-77a37c2a49ae?w=400&h=500&fit=crop&q=75",
      },
    ],
    []
  );

  return (
    <section className="max-w-6xl mx-auto mb-20">
      <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">
        Our Philosophy
      </h2>

      <div className="bg-gradient-to-br from-white via-green-50/30 to-gray-50 rounded-3xl p-8 shadow-2xl border border-green-100">
        <Suspense
          fallback={
            <LoadingSkeleton height="h-48" message="Loading Philosophy..." />
          }
        >
          <AnimatedTestimonials testimonials={testimonials} autoplay={true} />
        </Suspense>
      </div>
    </section>
  );
}
