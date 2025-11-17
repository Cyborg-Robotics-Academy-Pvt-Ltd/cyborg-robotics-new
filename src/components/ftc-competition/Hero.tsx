import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Trophy, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import placeholderImageData from "@/lib/Placeholder-images.json";

export function Hero() {
  const heroImage = placeholderImageData.placeholderImages.find(
    (img: {
      id: string;
      description: string;
      imageUrl: string;
      imageHint: string;
    }) => img.id === "hero-students-robot"
  );

  return (
    <section className="relative h-[90vh] w-full min-h-[600px] max-h-[800px] bg-background overflow-hidden">
      {heroImage && (
        <Image
          src={heroImage.imageUrl}
          alt={heroImage.description}
          fill
          className="object-cover"
          priority
          data-ai-hint={heroImage.imageHint}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/40" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/60" />
      <div className="relative z-10 flex h-full flex-col items-start justify-center text-white px-4 sm:px-6 lg:px-8">
        <div className="container max-w-7xl mx-auto">
          <div className="max-w-3xl">
            <div className="flex items-center mb-4">
              <Trophy className="h-6 w-6 text-yellow-400 mr-2" />
              <span className="text-yellow-400 font-semibold uppercase tracking-wider text-sm">
                Global Competition
              </span>
            </div>
            <h1 className="font-headline text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-left drop-shadow-[0_4px_3px_rgba(0,0,0,0.9)] leading-tight">
              Join Cyborg Robotics in the{" "}
              <span className="text-red-500">FTC Challenge</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg sm:text-xl text-left text-white/90 drop-shadow-[0_2px_1px_rgba(0,0,0,0.8)] font-medium">
              A global, prestigious robotics competition where young innovators
              build, code, and compete — with Cyborg Robotics guiding their
              journey to excellence.
            </p>
            <div className="mt-10 flex flex-wrap justify-start gap-4">
              <Button
                size="lg"
                asChild
                className="bg-white text-red-600 hover:bg-gray-100 hover:text-red-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
              >
                <Link href="#onboarding">
                  <Users className="mr-2 h-5 w-5" />
                  Join the Team
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="secondary"
                asChild
                className="bg-red-700 text-white hover:bg-red-800 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
              >
                <Link href="#about-ftc">
                  <Trophy className="mr-2 h-5 w-5" />
                  Explore FTC Journey
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
