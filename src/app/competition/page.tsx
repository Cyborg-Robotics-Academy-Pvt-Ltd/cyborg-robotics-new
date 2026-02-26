"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Trophy,
  Globe,
  ArrowRight,
  Users,
  Calendar,
  Star,
  TrendingUp,
  Sparkles,
  Clock,
  Lightbulb,
  Heart,
  ShieldCheck,
  GraduationCap,
  Medal,
  Target,
  Zap,
  Rocket,
  Crown,
  Award,
  Flame,
  Brain,
  Camera,
  Play,
  ChevronRight,
} from "lucide-react";
import Header from "@/components/layout/header";

export default function CompetitionHubPage() {
  // Random competition images
  const competitionImages = [
    {
      src: "/assets/events/competition.png",
      alt: "Students in robotics competition",
    },
  ];

  const [randomImage, setRandomImage] = useState(competitionImages[0]);

  useEffect(() => {
    // Set random image on component mount
    const randomIndex = Math.floor(Math.random() * competitionImages.length);
    setRandomImage(competitionImages[randomIndex]);
  }, []);

  // Advanced image preloading and caching system
  const [imageCache, setImageCache] = useState(new Map());
  const [visibleCards, setVisibleCards] = useState(new Set());

  // Preload images for better performance
  useEffect(() => {
    const preloadImages = async () => {
      const allImages = filteredTimelineEvents.flatMap((event) => event.images);
      const uniqueImages = [...new Set(allImages)];

      await Promise.all(
        uniqueImages.map(
          (src) =>
            new Promise<string>((resolve, reject) => {
              const img = new window.Image();
              img.onload = () => {
                setImageCache((prev) => new Map(prev.set(src, true)));
                resolve(src);
              };
              img.onerror = reject;
              img.src = src;
            }),
        ),
      );
    };

    preloadImages();
  }, []);

  // Intersection Observer for scroll-based animations
  const observerRef = useRef<IntersectionObserver>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const cardIndex = (entry.target as HTMLElement).dataset.index;
            setVisibleCards((prev) => new Set([...prev, cardIndex]));
          }
        });
      },
      { threshold: 0.1, rootMargin: "50px" },
    );

    const cards = document.querySelectorAll("[data-index]");
    cards.forEach((card) => observer.observe(card));

    return () => observer.disconnect();
  }, []);
  // Quick Stats Data
  const stats = [
    {
      label: "National & International Wins",
      value: "12+",
      icon: Trophy,
      suffix: "🏆",
    },
    {
      label: "Competition-Trained Students",
      value: "180+",
      icon: Users,
      suffix: "🎓",
    },
    {
      label: "Years of Competition Coaching",
      value: "5+",
      icon: Calendar,
      suffix: "📅",
    },
    {
      label: "Competitions (India & Global)",
      value: "Global",
      icon: Globe,
      suffix: "🌍",
    },
  ];

  // About Competition Features
  const features = [
    {
      icon: Trophy,
      title: "🏆 Proven Competition Track Record",
      description:
        "Our students consistently podium at competitions like IRO, WRO, and World STEM at regional, national, and international levels.",
      color: "from-yellow-500 to-orange-500",
    },
    {
      icon: Users,
      title: "👥 Competition-Focused Mentorship",
      description:
        "Mentors guide students with competition strategy, judging criteria, scoring optimization, and presentation skills.",
      color: "from-blue-500 to-indigo-500",
    },
    {
      icon: Lightbulb,
      title: "💡 Innovation & Strategy First",
      description:
        "We train students to think beyond kits—problem analysis, design justification, and scoring efficiency.",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: GraduationCap,
      title: "🎓 Skills That Perform on Stage",
      description:
        "From robot design and coding to teamwork and judging defense—skills built for real competition environments.",
      color: "from-green-500 to-teal-500",
    },
  ];
  // Add this data array at the top of your component (before the return statement)
  const competitions = [
    {
      id: 1,
      title: "International Robot Olympiad (IRO)",
      organizer: "International Robot Olympiad Committee",
      description:
        "A premier global robotics competition fostering creativity and innovation in young minds through challenging robot design and programming tasks.",
      image: "/assets/competitions/iro.jpg",
      icon: Crown,
      iconColor: "text-yellow-600",
      gradient: "from-yellow-500 to-orange-500",
      level: "International",
      achievement: "1st Place",
      participants: 45,
      year: "2024",
      link: "/competitions/iro",
    },
    {
      id: 2,
      title: "World Robot Olympiad (WRO)",
      organizer: "World Robot Olympiad Association",
      description:
        "International robotics competition bringing together young people to develop creativity and problem-solving skills through robot challenges.",
      image: "/assets/competitions/wro.jpg",
      icon: Globe,
      iconColor: "text-blue-600",
      gradient: "from-blue-500 to-indigo-500",
      level: "International",
      achievement: "Top 10",
      participants: 38,
      year: "2024",
      link: "/competitions/wro",
    },
    {
      id: 3,
      title: "World STEM Robotics",
      organizer: "World STEM & Robotics Organization",
      description:
        "Comprehensive STEM competition focused on robotics engineering, coding, and presentation skills with judges' evaluation.",
      image: "/assets/competitions/world-stem.jpg",
      icon: Award,
      iconColor: "text-purple-600",
      gradient: "from-purple-500 to-pink-500",
      level: "International",
      achievement: "Judges' Award",
      participants: 42,
      year: "2024",
      link: "/competitions/world-stem",
    },
    {
      id: 4,
      title: "FIRST Tech Challenge (FTC)",
      organizer:
        "FIRST (For Inspiration and Recognition of Science and Technology)",
      description:
        "Team-based robotics competition combining robot design, strategic game play, innovation, and outreach programs.",
      image: "/assets/events/ftc-thumbnail1.png",
      icon: Zap,
      iconColor: "text-red-600",
      gradient: "from-red-500 to-orange-500",
      level: "International",
      achievement: "Finalist",
      participants: 32,
      year: "2025",
      link: "/competitions/ftc",
    },
    {
      id: 5,
      title: "National Robotics Championship",
      organizer: "National Robotics Federation",
      description:
        "India's premier robotics competition showcasing technical excellence, innovation, and teamwork among students nationwide.",
      image: "/assets/competitions/national-robotics.jpg",
      icon: Medal,
      iconColor: "text-green-600",
      gradient: "from-green-500 to-teal-500",
      level: "National",
      achievement: "2nd Place",
      participants: 28,
      year: "2025",
      link: "/competitions/national-championship",
    },
    {
      id: 6,
      title: "Regional Robotics League",
      organizer: "Regional Education Board",
      description:
        "Quarterly robotics competitions focusing on practical problem-solving, mechanical design, and autonomous programming.",
      image: "/assets/competitions/regional-league.jpg",
      icon: Target,
      iconColor: "text-cyan-600",
      gradient: "from-cyan-500 to-blue-500",
      level: "Regional",
      achievement: "Champions",
      participants: 36,
      year: "2025",
      link: "/competitions/regional-league",
    },
  ];
  // Timeline Data - Based on actual awards from AwardSection.tsx
  // Define type for timeline events
  type TimelineEvent = {
    year: string;
    achievement: string;
    description: string;
    icon:
      | React.ComponentType<{ className?: string }>
      | typeof Trophy
      | typeof Award
      | typeof Crown;
    color: string;
    images: string[];
    link?: string;
  };

  // Filter timelineEvents to show only the specified competitions
  const filteredTimelineEvents: TimelineEvent[] = [
    {
      year: "2024-2025",
      achievement: "🇮🇳 Indian Robotics Olympiad (IRO) 2024 -2025",
      description:
        "1st, 2nd & 3rd Place – Indian Robotics Olympiad (IRO) 2024 -2025",
      icon: Trophy,
      color: "text-blue-500",
      images: ["/assets/competition/iro.avif"],
      link: "/competition/iro",
    },
    {
      year: "2024",
      achievement: "⚖️ World STEM & Robotics Olympiad",
      description: "3rd Place & Judges’ Award – Jr. Line Following (RoboTex)",
      icon: Crown,
      color: "text-purple-500",
      images: ["/assets/competition/wsro.avif"],
      link: "/competition/wsro",
    },
    {
      year: "2025",
      achievement: "🏆 RoboTex Championship",
      description: "3rd Place & Judges’ Award – Jr. Line Following (RoboTex)",
      icon: Award,
      color: "text-red-500",
      images: ["/assets/competition/robotex.avif"],
      link: "/competition/robotex",
    },
  ];

  // Awards & Certificates
  const awards = [
    { id: 1, src: "/assets/awards/IRO.png", alt: "IRO Championship" },
    { id: 2, src: "/assets/awards/Judges-awards.png", alt: "Judges Award" },
    { id: 3, src: "/assets/awards/Lego_Follower.png", alt: "Lego Competition" },
    { id: 4, src: "/assets/awards/Line-Follower.png", alt: "Line Follower" },
    { id: 5, src: "/assets/awards/jr.Robo-race.png", alt: "Junior Robot Race" },
    {
      id: 6,
      src: "/assets/awards/lego-line-follower.png",
      alt: "Lego Line Follower",
    },
  ];

  // Student Impact Points
  const impactPoints = [
    {
      icon: ShieldCheck,
      text: "🛡️ Enhanced Problem-Solving Skills",
      color: "bg-blue-500",
    },
    {
      icon: Heart,
      text: "❤️ Boosted Confidence & Presentation",
      color: "bg-red-500",
    },
    {
      icon: Users,
      text: "👥 Improved Teamwork & Collaboration",
      color: "bg-purple-500",
    },
    {
      icon: TrendingUp,
      text: "📈 Career Pathway Clarity",
      color: "bg-green-500",
    },
    {
      icon: Star,
      text: "⭐ Recognition & Achievement",
      color: "bg-yellow-500",
    },
    {
      icon: Globe,
      text: "🌍 Global Networking Opportunities",
      color: "bg-indigo-500",
    },
  ];

  // Preparation Process Steps
  const preparationSteps = [
    {
      step: 1,
      title: "🎯 Orientation",
      description: "Introduction to competition rules and objectives",
      icon: Target,
      color: "bg-red-500",
    },
    {
      step: 2,
      title: "🛠️ Build Phase",
      description: "Hands-on robot construction and programming",
      icon: Zap,
      color: "bg-blue-500",
    },
    {
      step: 3,
      title: "🧪 Testing",
      description: "Rigorous testing and optimization cycles",
      icon: Rocket,
      color: "bg-green-500",
    },
    {
      step: 4,
      title: "🎭 Mock Competitions",
      description: "Practice runs and strategy refinement",
      icon: Play,
      color: "bg-purple-500",
    },
    {
      step: 5,
      title: "🏁 Final Preparation",
      description: "Last-minute adjustments and mental readiness",
      icon: Flame,
      color: "bg-orange-500",
    },
  ];

  // Who Should Join Criteria
  const joinCriteria = [
    "Ages 8–16 years",
    "Beginner to Advanced robotics learners",
    "Students aiming for competitive robotics events",
    "Willingness to train, iterate, and compete",
    "Interest in problem-solving, innovation, and teamwork",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-white/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-white/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-white/15 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      <div className="relative z-10">
        <Header />
        {/* Hero Section */}
        <motion.section className="relative -mt-14 overflow-hidden bg-gradient-to-br from-[#8A2E2E] via-[#a63534] to-[#8A2E2E] text-white">
          {/* Animated Grid Background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff20_1px,transparent_1px),linear-gradient(to_bottom,#ffffff20_1px,transparent_1px)] bg-[size:4rem_4rem]" />

          <div className="container mx-auto px-4 pt-32 pb-24 relative">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
              {/* Left Content */}
              <div className="space-y-8">
                {/* Badge */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30 px-6 py-2 text-sm font-medium shadow-lg">
                    <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                    Competition Training & Championship Wins
                  </Badge>
                </motion.div>

                {/* Main Title */}
                <motion.h1 className="text-4xl md:text-6xl font-bold tracking-tight drop-shadow-[0_4px_30px_rgba(0,0,0,0.35)]">
                  <span className="text-white">We Train Students</span>
                  <br />
                  <span className="text-yellow-300 relative">
                    to Win Robotics Competitions
                    <motion.span
                      className="absolute -bottom-2 left-0 w-full h-1 bg-yellow-300 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 1, delay: 0.5 }}
                    />
                  </span>
                </motion.h1>

                {/* Description */}
                <motion.p className="text-xl text-white/90 max-w-xl leading-relaxed drop-shadow-md">
                  At Cyborg Robotics, students don't just learn robotics — they
                  compete and win. We provide end-to-end preparation for
                  national and international robotics competitions like IRO,
                  WRO, and World STEM.
                </motion.p>

                {/* CTA Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="flex flex-col sm:flex-row gap-4 pt-4"
                >
                  <Button
                    size="lg"
                    className="bg-white text-[#8A2E2E] hover:bg-gray-100 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 group"
                  >
                    View Our Competition Wins
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>

                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white/40 text-[#8A2E2E] bg-white  backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <Calendar className="mr-2 w-5 h-5" />
                    Upcoming Competitions
                  </Button>
                </motion.div>
              </div>

              {/* Right Image */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="relative flex justify-center"
              >
                <div className="relative w-full max-w-lg">
                  {/* Main container */}
                  <div className="relative  rounded-3xl  overflow-hidden">
                    <div className="flex items-center justify-center relative ">
                      <motion.div
                        className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.7, delay: 0.4 }}
                      >
                        <Image
                          src={randomImage.src}
                          alt={randomImage.alt}
                          width={800}
                          height={600}
                          className="object-cover w-full h-full"
                          priority
                        />
                      </motion.div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* Quick Stats Section */}
        <section className="py-20 bg-gradient-to-br from-white to-gray-50 relative overflow-hidden">
          {/* Background elements */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(138,46,46,0.05)_0%,transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(138,46,46,0.05)_0%,transparent_50%)]" />

          <div className="container mx-auto px-4 relative">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {stats.map((stat, index) => {
                const IconComponent = stat.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30, scale: 0.9 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ y: -10, scale: 1.05 }}
                    className="cursor-pointer"
                  >
                    <Card className="relative overflow-hidden border border-[#8A2E2E]/10 shadow-lg hover:shadow-2xl transition-all duration-300 group bg-white">
                      {/* Animated background */}
                      <div className="absolute inset-0 bg-gradient-to-br from-[#8A2E2E]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                      {/* Corner accent */}
                      <div className="absolute top-0 right-0 w-16 h-16 bg-[#8A2E2E]/10 rounded-bl-full" />

                      <CardContent className="p-6 relative">
                        <div className="flex justify-center mb-4">
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#8A2E2E] to-[#a63534] flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                            <IconComponent className="w-7 h-7 text-white" />
                          </div>
                        </div>

                        <div className="text-center">
                          <div className="flex items-center justify-center gap-2 mb-1">
                            <p className="text-3xl font-bold text-[#8A2E2E]">
                              {stat.value}
                            </p>
                            <span className="text-2xl">{stat.suffix}</span>
                          </div>
                          <p className="text-sm text-gray-600 font-medium leading-tight">
                            {stat.label}
                          </p>
                        </div>

                        {/* Hover effect indicator */}
                        <div className="absolute bottom-0 left-0 w-full h-1 bg-[#8A2E2E] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* About the Competition Section */}
        <section className="py-20 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white" />
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#8A2E2E] to-transparent" />

          <div className="container mx-auto px-4 relative">
            <div className="text-center mb-16 space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <Badge className="bg-[#8A2E2E]/10 text-[#8A2E2E] px-6 py-2 text-base font-semibold mb-4 shadow-md">
                  About Our Program
                </Badge>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-4xl md:text-5xl font-bold text-slate-900"
              >
                Why Compete With Us?
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed"
              >
                Transform your robotics journey through world-class competitions
              </motion.p>

              {/* Decorative elements */}
              <div className="flex justify-center gap-2 mt-6">
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 bg-[#8A2E2E] rounded-full"
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                  />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {features.map((feature, index) => {
                const IconComponent = feature.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ y: -8 }}
                    className="cursor-pointer"
                  >
                    <Card className="h-full border-0 shadow-xl hover:shadow-2xl transition-all duration-300 group overflow-hidden bg-white">
                      {/* Gradient header */}
                      <div
                        className={`h-2 bg-gradient-to-r ${feature.color}`}
                      />

                      <CardContent className="p-8">
                        <div className="flex items-start gap-4">
                          <div
                            className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300 flex-shrink-0`}
                          >
                            <IconComponent className="w-8 h-8 text-white" />
                          </div>

                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-[#8A2E2E] transition-colors">
                              {feature.title}
                            </h3>
                            <p className="text-slate-600 leading-relaxed">
                              {feature.description}
                            </p>
                          </div>
                        </div>

                        {/* Bottom accent */}
                        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#8A2E2E]/30 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Cyborg Performance Timeline */}
        <section className="py-20 bg-gradient-to-br from-white to-gray-50 relative overflow-hidden">
          {/* Background elements */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(138,46,46,0.03)_0%,transparent_70%)]" />

          <div className="container mx-auto px-4 relative">
            <div className="text-center mb-16 space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <Badge className="bg-[#8A2E2E]/10 text-[#8A2E2E] px-6 py-2 text-base font-semibold mb-4 shadow-md">
                  Our Achievements
                </Badge>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-4xl md:text-5xl font-bold text-slate-900"
              >
                Cyborg Robotics Performance
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed"
              >
                Celebrating years of excellence in competitive robotics
              </motion.p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto px-4">
              {filteredTimelineEvents.map((event, index) => {
                const IconComponent = event.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ y: -10, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="cursor-pointer"
                  >
                    <Card
                      className="relative bg-white border border-[#8A2E2E]/10 shadow-lg hover:shadow-2xl transition-all duration-300 group overflow-hidden h-full cursor-pointer"
                      onClick={() =>
                        event.link && window.open(event.link, "_self")
                      }
                    >
                      {/* Header with gradient */}
                      <div
                        className={`h-2 bg-gradient-to-r ${event.color.replace("text-", "from-").replace("-500", "-500")} to-purple-500`}
                      />

                      {/* Icon badge */}
                      <div className="absolute -top-3 -right-3 w-12 h-12 bg-white border-4 border-[#8A2E2E] rounded-full flex items-center justify-center shadow-lg">
                        <IconComponent className={`w-5 h-5 ${event.color}`} />
                      </div>

                      <CardContent className="p-6 pt-8">
                        {/* Year badge */}
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-8 h-8 rounded-full bg-[#8A2E2E]/10 flex items-center justify-center">
                            <Clock className="w-4 h-4 text-[#8A2E2E]" />
                          </div>
                          <span className="text-sm font-semibold text-[#8A2E2E]">
                            {event.year}
                          </span>
                        </div>

                        {/* Advanced Competition Image Container */}
                        <div
                          className="relative mb-4 rounded-2xl overflow-hidden h-48 shadow-xl group/image"
                          data-index={index}
                        >
                          {/* Performance-optimized background layers */}
                          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
                          <div className="absolute inset-0 backdrop-blur-xs bg-white/5" />

                          {/* Advanced Image Rendering with Scroll Triggering */}
                          <motion.div
                            className="relative w-full h-full"
                            initial={{
                              opacity: 0,
                              scale: 0.95,
                              filter: "blur(2px)",
                            }}
                            animate={
                              visibleCards.has(index.toString())
                                ? {
                                    opacity: 1,
                                    scale: 1,
                                    filter: "blur(0px)",
                                  }
                                : {}
                            }
                            transition={{
                              duration: 0.6,
                              delay: index * 0.05,
                              ease: "easeOut",
                            }}
                          >
                            <Image
                              src={event.images[0]}
                              alt={`${event.achievement} competition showcase`}
                              fill
                              className={`object-cover transition-all duration-700 ease-out ${
                                visibleCards.has(index.toString())
                                  ? "group-hover/image:scale-110 group-hover/image:brightness-110 group-hover/image:saturate-125"
                                  : ""
                              }`}
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                              quality={90}
                              placeholder="blur"
                              blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjMyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjVmNWY1Ii8+PGNpcmNsZSBjeD0iMTYwIiBjeT0iMTYwIiByPSI0MCIgZmlsbD0iI2RkZCIvPjwvc3ZnPg=="
                              onLoadingComplete={(img) => {
                                img.parentElement?.classList.add(
                                  "image-loaded",
                                );
                                img.style.transition =
                                  "all 0.7s cubic-bezier(0.4, 0, 0.2, 1)";
                              }}
                              onError={(e) => {
                                console.warn(
                                  `Image failed to load: ${e.currentTarget.src}`,
                                );
                                e.currentTarget.src =
                                  "https://yourdomain.com/assets/events/competition.png";
                              }}
                            />
                          </motion.div>

                          {/* Sophisticated Multi-layer Gradient Overlays */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />
                          <div className="absolute inset-0 bg-gradient-to-r from-[#8A2E2E]/10 to-transparent opacity-30" />
                          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-20" />

                          {/* Dynamic Floating Elements System */}
                          <div className="absolute top-3 right-3 flex gap-2">
                            {[...Array(3)].map((_, i) => (
                              <motion.div
                                key={i}
                                className={`w-2 h-2 rounded-full backdrop-blur-sm ${
                                  i === 0
                                    ? "bg-white/40"
                                    : i === 1
                                      ? "bg-blue-300/30"
                                      : "bg-purple-300/30"
                                }`}
                                animate={
                                  visibleCards.has(index.toString())
                                    ? {
                                        scale: [1, 1.3, 1],
                                        opacity: [0.4, 0.8, 0.4],
                                        y: [0, -3, 0],
                                      }
                                    : {}
                                }
                                transition={{
                                  duration: 2 + i * 0.3,
                                  repeat: Infinity,
                                  delay: i * 0.2,
                                  ease: "easeInOut",
                                }}
                              />
                            ))}
                          </div>
                        </div>

                        {/* Achievement title */}
                        <h3 className="text-lg font-bold text-slate-900 mb-3 group-hover:text-[#8A2E2E] transition-colors leading-tight">
                          {event.achievement}
                        </h3>

                        {/* Description */}
                        <p className="text-gray-600 text-sm leading-relaxed mb-4">
                          {event.description}
                        </p>

                        {/* Enhanced Link Button with Better Styling */}
                        <motion.div
                          className="mt-4"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                        >
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="inline-block"
                          >
                            <Link
                              href={event.link || "#"}
                              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#8A2E2E] to-[#a63534] text-white px-4 py-2 rounded-lg font-medium text-sm shadow-lg hover:shadow-xl transition-all duration-300 group/link transform hover:-translate-y-0.5"
                            >
                              <span>View Details</span>
                              <ArrowRight className="w-4 h-4 transition-transform group-hover/link:translate-x-1" />
                            </Link>
                          </motion.div>
                        </motion.div>

                        {/* Enhanced Hover Effects */}
                        <div className="absolute inset-0 bg-gradient-to-br from-[#8A2E2E]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                        {/* Click indicator */}
                        {event.link && (
                          <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="w-8 h-8 rounded-full bg-[#8A2E2E]/20 flex items-center justify-center backdrop-blur-sm">
                              <ArrowRight className="w-4 h-4 text-[#8A2E2E]" />
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Awards & Certificates Gallery */}
        <section className="py-20 relative overflow-hidden">
          {/* Background elements */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white" />
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent" />

          <div className="container mx-auto px-4 relative">
            <div className="text-center mb-16 space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <Badge className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-700 px-6 py-2 text-base font-semibold mb-4 shadow-md">
                  <Star className="w-4 h-4 mr-2 inline" />
                  Recognition & Awards
                </Badge>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-4xl md:text-5xl font-bold text-slate-900"
              >
                Awards & Certificates
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed"
              >
                Celebrating verified wins from national and international
                robotics competitions
              </motion.p>
            </div>

            {/* Masonry Grid Layout */}
            <div className="columns-2 md:columns-3 lg:columns-4 gap-6 max-w-6xl mx-auto">
              {awards.map((award, index) => (
                <motion.div
                  key={award.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -10, scale: 1.05 }}
                  className="mb-6 break-inside-avoid cursor-pointer group"
                >
                  <div className="relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100">
                    {/* Image with overlay */}
                    <div className="relative overflow-hidden">
                      <Image
                        src={award.src}
                        alt={award.alt}
                        width={400}
                        height={400}
                        className="w-full h-auto object-cover group-hover:scale-110 transition-transform duration-500"
                      />

                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                        <div className="text-white font-medium text-sm">
                          {award.alt}
                        </div>
                      </div>

                      {/* Shine effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />
                    </div>

                    {/* Glow effect on hover */}
                    <div className="absolute inset-0 rounded-2xl shadow-[0_0_20px_rgba(255,215,0,0.3)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                    {/* Corner badge */}
                    <div className="absolute top-3 right-3 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
                      <Trophy className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* View More Button */}
            <motion.div
              className="text-center mt-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
            >
              <Button
                variant="outline"
                className="border-2 border-[#8A2E2E] text-[#8A2E2E] hover:bg-[#8A2E2E] hover:text-white px-8 py-3 rounded-full font-semibold transition-all duration-300 group"
              >
                View All Awards
                <ChevronRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
          </div>
        </section>

        {/* Student Impact Section */}
        <section className="py-20 bg-gradient-to-br from-white to-gray-50 relative overflow-hidden">
          {/* Background elements */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(138,46,46,0.04)_0%,transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(138,46,46,0.04)_0%,transparent_50%)]" />

          <div className="container mx-auto px-4 relative">
            <div className="text-center mb-16 space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <Badge className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-700 px-6 py-2 text-base font-semibold mb-4 shadow-md">
                  <Brain className="w-4 h-4 mr-2 inline" />
                  Student Success
                </Badge>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-4xl md:text-5xl font-bold text-slate-900"
              >
                Student Impact
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed"
              >
                How our competitions transform young minds
              </motion.p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto items-center">
              {/* Left: Image */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
                className="relative"
              >
                <div className="relative bg-gradient-to-br from-[#8A2E2E] to-[#a63534] rounded-3xl p-1 shadow-2xl">
                  <div className="bg-white rounded-2xl overflow-hidden aspect-video relative">
                    <Image
                      src="/assets/events/competition.png"
                      alt="Students in competition"
                      width={600}
                      height={400}
                      className="w-full h-full object-cover"
                    />

                    {/* Overlay with play button */}
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform cursor-pointer">
                        <Play className="w-6 h-6 text-[#8A2E2E] ml-1" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating elements around image */}
                <motion.div
                  className="absolute -top-4 -right-4 w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Trophy className="w-6 h-6 text-white" />
                </motion.div>

                <motion.div
                  className="absolute -bottom-4 -left-4 w-12 h-12 bg-blue-400 rounded-full flex items-center justify-center shadow-lg"
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                >
                  <Users className="w-6 h-6 text-white" />
                </motion.div>
              </motion.div>

              {/* Right: Impact Points */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="space-y-6"
              >
                {impactPoints.map((point, index) => {
                  const IconComponent = point.icon;
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      whileHover={{ x: 10 }}
                      className="flex items-start gap-4 p-5 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group cursor-pointer"
                    >
                      <motion.div
                        className={`flex-shrink-0 w-12 h-12 rounded-xl ${point.color} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300`}
                        whileHover={{ rotate: 10 }}
                      >
                        <IconComponent className="w-6 h-6 text-white" />
                      </motion.div>

                      <div className="flex-1">
                        <p className="text-lg text-gray-800 font-semibold group-hover:text-[#8A2E2E] transition-colors">
                          {point.text}
                        </p>

                        {/* Progress bar animation on hover */}
                        <div className="mt-2 h-1 bg-gray-200 rounded-full overflow-hidden">
                          <motion.div
                            className={`${point.color.replace("bg-", "bg-")} h-full rounded-full`}
                            initial={{ width: 0 }}
                            whileHover={{ width: "100%" }}
                            transition={{ duration: 0.5 }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            </div>
          </div>
        </section>

        {/* Preparation Process Section */}
        <section className="py-20 relative overflow-hidden">
          {/* Background elements */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white" />
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent" />

          <div className="container mx-auto px-4 relative">
            <div className="text-center mb-16 space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <Badge className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-700 px-6 py-2 text-base font-semibold mb-4 shadow-md">
                  <Target className="w-4 h-4 mr-2 inline" />
                  Our Process
                </Badge>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-4xl md:text-5xl font-bold text-slate-900"
              >
                Preparation Journey
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed"
              >
                Structured approach to competition success
              </motion.p>
            </div>

            <div className="max-w-6xl mx-auto">
              <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-8 md:gap-6">
                {preparationSteps.map((step, index) => {
                  const IconComponent = step.icon;
                  return (
                    <motion.div
                      key={step.step}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      whileHover={{ y: -10 }}
                      className="flex-1 text-center relative group cursor-pointer"
                    >
                      {/* Step Circle with gradient */}
                      <motion.div
                        className="relative z-10 mb-6"
                        whileHover={{ scale: 1.1 }}
                      >
                        <div
                          className={`w-20 h-20 rounded-full ${step.color} flex items-center justify-center mx-auto shadow-xl border-4 border-white relative`}
                        >
                          <IconComponent className="w-8 h-8 text-white" />

                          {/* Pulse effect */}
                          <div
                            className={`absolute inset-0 rounded-full ${step.color} opacity-30 animate-ping`}
                          />
                        </div>

                        {/* Step number */}
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-white border-2 border-[#8A2E2E] rounded-full flex items-center justify-center text-[#8A2E2E] font-bold text-sm shadow-lg">
                          {step.step}
                        </div>
                      </motion.div>

                      {/* Connector Line (except for last item) */}
                      {index < preparationSteps.length - 1 && (
                        <div className="hidden md:block absolute top-10 left-full w-full h-1">
                          <motion.div
                            className="h-full bg-gradient-to-r from-[#8A2E2E] to-transparent"
                            initial={{ width: 0 }}
                            whileInView={{ width: "100%" }}
                            viewport={{ once: true }}
                            transition={{ duration: 1, delay: index * 0.2 }}
                          />
                        </div>
                      )}

                      {/* Content Card */}
                      <motion.div
                        className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 relative overflow-hidden"
                        whileHover={{
                          boxShadow:
                            "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                        }}
                      >
                        {/* Accent top border */}
                        <div
                          className={`absolute top-0 left-0 right-0 h-1 ${step.color.replace("bg-", "bg-")}`}
                        />

                        <h3
                          className={`font-bold text-lg ${step.color.replace("bg-", "text-")} mb-3`}
                        >
                          {step.title}
                        </h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          {step.description}
                        </p>

                        {/* Hover glow effect */}
                        <div
                          className={`absolute inset-0 rounded-2xl shadow-inner opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none ${step.color.replace("bg-", "shadow-").replace("-500", "-500/20")}`}
                        />
                      </motion.div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Process summary card at the bottom */}
              <motion.div
                className="mt-16 max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
              >
                <Card className="bg-gradient-to-r from-[#8A2E2E]/5 to-[#a63534]/5 border border-[#8A2E2E]/20">
                  <CardContent className="p-6 text-center">
                    <div className="flex items-center justify-center gap-3 mb-3">
                      <Rocket className="w-6 h-6 text-[#8A2E2E]" />
                      <h3 className="text-xl font-bold text-[#8A2E2E]">
                        Complete Competition Readiness
                      </h3>
                    </div>
                    <p className="text-gray-700">
                      Our 5-step process ensures students are fully prepared for
                      competition success, combining technical skills with
                      strategic thinking and presentation excellence.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Who Should Join Section */}
        <section className="py-20 bg-gradient-to-br from-white to-gray-50 relative">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16 space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <Badge className="bg-[#8A2E2E]/10 text-[#8A2E2E] px-4 py-1 text-sm font-semibold mb-4">
                  Perfect Fit
                </Badge>
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-4xl md:text-5xl font-bold text-slate-900"
              >
                Who Should Join?
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="text-xl text-slate-600 max-w-2xl mx-auto"
              >
                Ideal candidates for our robotics competition program
              </motion.p>
            </div>

            <div className="max-w-2xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl p-8 shadow-xl border border-[#8A2E2E]/10"
              >
                <ul className="space-y-4">
                  {joinCriteria.map((criteria, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="flex items-start gap-3"
                    >
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#8A2E2E] flex items-center justify-center mt-0.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-white" />
                      </div>
                      <span className="text-lg text-gray-700">{criteria}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#8A2E2E] via-[#a63534] to-[#8A2E2E] text-white" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff10_1px,transparent_1px),linear-gradient(to_bottom,#ffffff10_1px,transparent_1px)] bg-[size:4rem_4rem]" />

          <div className="container mx-auto px-4 relative">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-4xl mx-auto text-center space-y-8"
            >
              <motion.div
                className="inline-block"
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30 px-6 py-3 text-base font-semibold mb-6 shadow-xl">
                  <Sparkles className="w-5 h-5 mr-2 animate-spin" />
                  Transform Your Child's Future
                </Badge>
              </motion.div>

              <motion.h2
                className="text-4xl md:text-6xl font-bold text-white"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
              >
                Ready to See Your Child on the{" "}
                <span className="relative inline-block">
                  Winners' Podium?
                  <motion.span
                    className="absolute -bottom-2 left-0 w-full h-1 bg-yellow-300 rounded-full"
                    initial={{ width: 0 }}
                    whileInView={{ width: "100%" }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 1 }}
                  />
                </span>
              </motion.h2>

              <motion.p
                className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
              >
                Join a competition-focused robotics program with proven national
                and international wins.
              </motion.p>
            </motion.div>
          </div>
        </section>
      </div>
    </div>
  );
}
