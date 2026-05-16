"use client";
import React, { useMemo } from "react";
import { Brain, Lightbulb, BookOpen, Cpu, Eye } from "lucide-react";

const Feature2: React.FC = React.memo(() => {
  const features = useMemo(
    () => [
      {
        title: "Creative Learning",
        quote: "Hands-on projects that turn ideas into working creations.",
        icon: Lightbulb,
        glowColor: "#8D0F11",
        backgroundImage: "/assets/whoarewe/creative.jpg",
      },
      {
        title: "Simplified Education",
        quote: "Clear, step-by-step lessons that make robotics accessible.",
        icon: BookOpen,
        glowColor: "#8D0F11",
        backgroundImage: "/assets/whoarewe/simplifiededucation.jpg",
      },
      {
        title: "Latest Technology",
        quote: "Practical experience with modern tools like AI and automation.",
        icon: Cpu,
        glowColor: "#8D0F11",
        backgroundImage: "/assets/whoarewe/latesttechnology.jpg",
      },
      {
        title: "Futuristic Vision",
        quote: "Preparing learners for AI-driven industries of the future.",
        icon: Eye,
        glowColor: "#8D0F11",
        backgroundImage: "/assets/whoarewe/futuristicvision.jpg",
      },
    ],
    [],
  );

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white to-gray-50 py-12 md:py-16 text-black">
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .feature-section-header {
          animation: fadeInUp 0.6s ease-out;
        }

        .feature-grid {
          animation: fadeInUp 0.6s ease-out 0.2s both;
        }

        .feature-card {
          animation: fadeInUp 0.6s ease-out both;
        }

        .feature-card:nth-child(1) { animation-delay: 0.3s; }
        .feature-card:nth-child(2) { animation-delay: 0.4s; }
        .feature-card:nth-child(3) { animation-delay: 0.5s; }
        .feature-card:nth-child(4) { animation-delay: 0.6s; }

        .feature-card-inner {
          transition: all 0.3s ease;
        }

        .feature-card-inner:hover {
          border-color: rgba(141, 15, 17, 0.4);
          background-color: rgba(255, 255, 255, 0.15);
        }

        .feature-card-bg {
          transition: all 0.5s ease;
          opacity: 0;
          transform: scale(0.9);
        }

        .feature-card-inner:hover .feature-card-bg {
          opacity: 0.25;
          transform: scale(1);
        }

        .feature-icon {
          transition: all 0.5s ease;
        }

        .feature-card-inner:hover .feature-icon {
          transform: scale(1.1);
        }

        .feature-title {
          transition: all 0.3s ease;
        }

        .feature-divider {
          transition: transform 0.3s ease;
        }

        .feature-card-inner:hover .feature-divider {
          transform: scaleX(1.25);
        }

        .feature-quote {
          transition: color 0.3s ease;
        }

        .feature-card-inner:hover .feature-quote {
          color: rgb(55, 65, 81);
        }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header Section */}
        <div className="feature-section-header mb-12 md:mb-16 text-center w-full">
          <div className="flex justify-center mb-3">
            <div className="rounded-full bg-[#8D0F11]/10 p-3">
              <Brain className="w-6 h-6 text-[#8D0F11]" />
            </div>
          </div>

          <h1 className="font-extrabold text-2xl sm:text-3xl md:text-4xl leading-tight">
            Why{" "}
            <span className="bg-gradient-to-r from-[#8D0F11] to-[#C73E1D] bg-clip-text text-transparent">
              Learn Robotics?
            </span>
          </h1>

          <div className="flex items-center justify-center gap-1 my-4">
            <div className="w-8 h-0.5 bg-gradient-to-r from-transparent to-[#8D0F11]/60 rounded-full"></div>
            <div className="w-16 h-0.5 bg-gradient-to-r from-[#8D0F11]/60 to-[#8D0F11] rounded-full"></div>
            <div className="w-8 h-0.5 bg-gradient-to-r from-[#8D0F11] to-transparent rounded-full"></div>
          </div>

          <p className="text-gray-600 text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Hands-on projects in engineering and coding — build creativity,
            logic and future-ready skills.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="feature-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {features.map((t, index) => {
            const IconComponent = t.icon;
            return (
              <div key={index} className="feature-card">
                <div className="group relative flex flex-col items-center overflow-hidden rounded-3xl border border-white/20 bg-white/10 p-6 sm:p-8 text-center shadow-lg backdrop-blur-lg h-full feature-card-inner">
                  {/* Background image */}
                  <div
                    className="absolute inset-0 feature-card-bg"
                    style={{
                      backgroundImage: `url(${t.backgroundImage})`,
                      backgroundSize: "contain",
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "center",
                    }}
                  ></div>

                  <div className="relative z-10 w-full flex flex-col items-center">
                    {/* Icon */}
                    <div className="mb-4 flex items-center justify-center">
                      <div className="feature-icon transform rounded-2xl bg-[#8D0F11] p-3 shadow-lg">
                        <IconComponent className="h-6 w-6 text-white" />
                      </div>
                    </div>

                    {/* Title */}
                    <h2 className="feature-title mb-3 text-xl sm:text-2xl font-bold bg-gradient-to-r from-[#8D0F11] to-[#C73E1D] bg-clip-text text-transparent">
                      {t.title}
                    </h2>

                    {/* Divider */}
                    <div
                      className="feature-divider mx-auto mb-4 h-1 w-12 rounded-full"
                      style={{
                        backgroundImage: `linear-gradient(to right, ${t.glowColor}, ${t.glowColor}90)`,
                      }}
                    ></div>

                    {/* Quote */}
                    <p className="feature-quote text-center text-xs sm:text-sm leading-relaxed text-gray-600">
                      {t.quote}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
});

Feature2.displayName = "Feature2";
export default Feature2;
