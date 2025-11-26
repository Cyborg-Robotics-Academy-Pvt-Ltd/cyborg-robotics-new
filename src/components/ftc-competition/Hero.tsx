import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Trophy, Users } from "lucide-react";

import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative w-full min-h-[400px]  md:min-h-[500px] lg:min-h-[600px] xl:min-h-[700px] max-h-[800px] bg-background overflow-hidden">
      <Image
        src="/assets/events/ftc-thumbnail1.png"
        alt="FTC Competition"
        fill
        className="object-cover"
        priority
        data-ai-hint="FTC Competition"
      />

      <div className="absolute inset-0 bg-black/40 " />
      <div className="relative z-10 flex md:mt-2 mt-6 pb-4 h-full flex-col items-start justify-center text-white px-4 sm:px-6 lg:px-8">
        <div className="container max-w-7xl mx-auto">
          <div className="max-w-3xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-6 mt-12 sm:mt-16 md:mt-20">
              <div className="relative w-32 h-8 sm:w-40 sm:h-10 md:w-44 md:h-10 flex-shrink-0">
                <Image
                  src="/assets/events/ftc-logo1.png"
                  alt="FTC Logo"
                  fill
                  className="object-contain filter drop-shadow-md"
                />
              </div>
              <span className="relative text-white font-bold uppercase px-3 py-1.5 sm:px-4 sm:py-2 tracking-wider text-xs sm:text-sm rounded-full bg-gradient-to-r from-red-800 to-red-900 backdrop-blur-md shadow-xl hover:shadow-[0_0_25px_rgba(153,27,27,0.5)] transition-all duration-500 transform hover:-translate-y-0.5 border border-red-700 hover:border-red-500 overflow-hidden group w-fit">
                <span className="absolute inset-0 bg-gradient-to-r from-red-900/30 to-red-700/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                <span className="relative z-10 flex items-center gap-1.5 sm:gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3 w-3 sm:h-4 sm:w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-center">
                    OFFICIAL FTC TRAINING PARTNER
                  </span>
                </span>
              </span>
            </div>
            <h1 className="font-headline text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-left drop-shadow-[0_4px_3px_rgba(0,0,0,0.9)] leading-tight mb-3 sm:mb-4">
              Join Cyborg Robotics in the{" "}
              <span className="text-red-400 block sm:inline">
                FTC Challenge
              </span>
            </h1>
            <p className="mt-3 sm:mt-4 max-w-2xl text-sm xs:text-base sm:text-xl md:text-xl text-left text-white/95 drop-shadow-[0_2px_1px_rgba(0,0,0,0.8)] font-medium">
              Young inventors build, code and compete in this worldwide,
              esteemed robotics competition, with Cyborg Robotics as an official
              training partner assisting them on their path to success.
            </p>
            <div className="mt-6 w-72 sm:mt-8 md:mt-10 flex flex-col xs:flex-row justify-start gap-3 sm:gap-4">
              <Button
                size="lg"
                asChild
                className="bg-white text-red-700 hover:bg-gray-100 hover:text-red-800 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5 text-sm sm:text-base"
              >
                <Link href="https://docs.google.com/forms/d/e/1FAIpQLScsyPIaYIeznyzY48p_wquf1T4TLym5snO6xn3Iz_Epq63gjw/viewform">
                  <Users className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  Join the Team
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="secondary"
                asChild
                className="bg-red-800 text-white hover:bg-red-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5 text-sm sm:text-base"
              >
                <Link href="#about-ftc">
                  <Trophy className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
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
