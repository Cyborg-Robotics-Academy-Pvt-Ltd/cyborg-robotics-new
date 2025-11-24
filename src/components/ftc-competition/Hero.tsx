import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Trophy, Users } from "lucide-react";

import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative h-screen w-full min-h-[600px] max-h-[800px] bg-background overflow-hidden">
      <Image
        src="/assets/events/ftc-thumbnail.png"
        alt="FTC Competition"
        fill
        className="object-cover"
        priority
        data-ai-hint="FTC Competition"
      />

      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/40" />
      <div className="relative z-10 flex h-full flex-col items-start justify-center text-white px-4 sm:px-6 lg:px-8">
        <div className="container max-w-7xl mx-auto">
          <div className="max-w-3xl">
            <div className="inline-flex items-center mb-4 px-3 py-1 rounded-full bg-gradient-to-r from-yellow-500/30 to-red-500/30 border border-yellow-400/40 backdrop-blur-sm">
              <Trophy className="h-5 w-5 text-yellow-300 mr-2 flex-shrink-0" />
              <span className="text-white font-bold uppercase tracking-widest text-xs">
                GLOBAL FTC COMPETITION - OFFICIAL TRAINING PARTNER
              </span>
            </div>
            <h1 className="font-headline text-2xl sm:text-3xl md:text-5xl lg:text-5xl font-bold tracking-tight text-left drop-shadow-[0_4px_3px_rgba(0,0,0,0.9)] leading-tight">
              Join Cyborg Robotics in the{" "}
              <span className="text-red-400">FTC Challenge</span>
            </h1>
            <p className="mt-6 max-w-2xl text-base sm:text-lg md:text-xl text-left text-white/95 drop-shadow-[0_2px_1px_rgba(0,0,0,0.8)] font-medium">
              Young inventors build, code and compete in this worldwide,
              esteemed robotics competition, with Cyborg Robotics as an official
              training partner assisting them on their path to success.
            </p>
            <div className="mt-8 sm:mt-12 md:mt-16 flex flex-col sm:flex-row justify-start gap-4">
              <Button
                size="lg"
                asChild
                className="bg-white text-red-700 hover:bg-gray-100 hover:text-red-800 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 w-full sm:w-auto"
              >
                <Link href="https://docs.google.com/forms/d/e/1FAIpQLScsyPIaYIeznyzY48p_wquf1T4TLym5snO6xn3Iz_Epq63gjw/viewform">
                  <Users className="mr-2 h-5 w-5" />
                  Join the Team
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="secondary"
                asChild
                className="bg-red-600 text-white hover:bg-red-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 w-full sm:w-auto"
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
