"use client";

import Header from "@/components/layout/header";
import { Timeline } from "@/components/ui/timeline";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Calendar,
  Check,
  ChevronRight,
  Clock,
  GraduationCap,
  MapPin,
  Medal,
  Star,
  Target,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import Image from "next/image";
import { useRef, type ComponentType } from "react";

type OverviewItem = {
  icon: ComponentType<{ className?: string }>;
  title: string;
  description: string;
};

type AwardItem = {
  id: number;
  title: string;
  subtitle: string;
  image: string;
  medal: "gold" | "silver" | "bronze";
};

const medalStyles: Record<
  AwardItem["medal"],
  { label: string; badgeClass: string; chipClass: string }
> = {
  gold: {
    label: "1st Place",
    badgeClass: "bg-yellow-100 text-yellow-800 border-yellow-200",
    chipClass: "bg-yellow-500",
  },
  silver: {
    label: "2nd Place",
    badgeClass: "bg-slate-100 text-slate-800 border-slate-200",
    chipClass: "bg-slate-500",
  },
  bronze: {
    label: "3rd Place",
    badgeClass: "bg-amber-100 text-amber-800 border-amber-200",
    chipClass: "bg-amber-600",
  },
};

function InfoCard({ item }: { item: OverviewItem }) {
  const Icon = item.icon;

  return (
    <Card className="h-full border-gray-100 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <CardHeader className="p-5 md:p-6 pb-2">
        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mb-3">
          <Icon className="h-5 w-5 text-red-600" />
        </div>
        <CardTitle className="text-xl">{item.title}</CardTitle>
      </CardHeader>
      <CardContent className="p-5 md:p-6 pt-0">
        <p className="text-gray-600">{item.description}</p>
      </CardContent>
    </Card>
  );
}

function AwardCard({ award }: { award: AwardItem }) {
  const medalStyle = medalStyles[award.medal];

  return (
    <Card className="overflow-hidden border-gray-100 hover:shadow-xl transition-shadow h-full">
      <div className="relative h-48 bg-gray-100">
        <Image
          src={award.image}
          alt={award.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-contain p-4"
        />
      </div>

      <CardContent className="p-6 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <Badge className={`border ${medalStyle.badgeClass}`}>
            {medalStyle.label}
          </Badge>
          <span
            className={`inline-flex items-center justify-center w-3 h-3 rounded-full ${medalStyle.chipClass}`}
            aria-hidden="true"
          />
        </div>
        <h3 className="font-semibold text-lg text-gray-900">{award.title}</h3>
        <p className="text-sm text-gray-600">{award.subtitle}</p>
      </CardContent>
    </Card>
  );
}

const IROPage = () => {
  const timelineRef = useRef<HTMLDivElement>(null);

  const scrollToTimeline = () => {
    const element = timelineRef.current;
    if (!element) return;

    const rect = element.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const offsetPosition = rect.top + scrollTop - 100;

    window.scrollTo({ top: offsetPosition, behavior: "smooth" });
  };

  const competitionData = {
    level: "National Level Competition",
    logo: "/assets/awards/IRO.png",
  };

  const quickStats = [
    { value: "4", label: "National Awards", icon: Trophy },
    { value: "1st", label: "Place at IRO 2025 & 2024", icon: Medal },
    { value: "100+", label: "Students Trained", icon: GraduationCap },
  ];

  const overviewData: OverviewItem[] = [
    {
      icon: Users,
      title: "Eligibility",
      description: "Ages 9-16, beginner to intermediate learners",
    },
    {
      icon: Zap,
      title: "Competition Format",
      description: "Design -> Build -> Test -> Present to judges",
    },
    {
      icon: Trophy,
      title: "Recognition",
      description: "Official national platform with ranking and awards",
    },
    {
      icon: Star,
      title: "Categories",
      description: "Junior and Innovators tracks",
    },
    {
      icon: Target,
      title: "Outcome",
      description: "Confidence, engineering thinking, and stage exposure",
    },
    {
      icon: Clock,
      title: "Training Duration",
      description: "8-12 weeks structured preparation",
    },
  ];

  const valueData = [
    "Students build real working robots to solve engineering challenges.",
    "Teams present their projects before national-level judges.",
    "Children learn debugging, testing, and iterative improvement under deadlines.",
    "Competition practice builds decision-making and confidence under pressure.",
    "Projects create a strong STEM profile for future opportunities.",
    "Students work in teams and communicate technical ideas clearly.",
  ];

  const awards: AwardItem[] = [
    {
      id: 1,
      title: "Indian Robotics Olympiad 2025",
      subtitle: "Innovators Category",
      image: "/assets/awards/IRO-2025-INNOVATORS-1ST.png",
      medal: "gold",
    },
    {
      id: 2,
      title: "Indian Robotics Olympiad 2024",
      subtitle: "Techies Category",
      image: "/assets/awards/IRO-2024-TECHIES-1ST.png",
      medal: "gold",
    },
    {
      id: 3,
      title: "Indian Robotics Olympiad 2024",
      subtitle: "Techies Category",
      image: "/assets/awards/IRO-2024-TECHIES-3RD.png",
      medal: "bronze",
    },
    {
      id: 4,
      title: "Indian Robotics Olympiad 2024",
      subtitle: "Innovators Category",
      image: "/assets/awards/IRO-2024-INNOVATORS-3RD.png",
      medal: "bronze",
    },
  ];

  const skillsDeveloped = [
    "Build real robots with motors, sensors, and controller boards",
    "Program sensors and automate robot decisions",
    "Solve engineering challenges through test-and-improve cycles",
    "Present projects clearly to judges and audiences",
    "Collaborate in teams with role-based task ownership",
    "Plan and execute under competition timelines",
  ];

  const eligibilityData = [
    {
      title: "Age Group",
      value: "9-16 years",
      icon: Users,
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Skill Level",
      value: "Beginner to Intermediate",
      icon: Star,
      color: "bg-green-100 text-green-600",
    },
    {
      title: "Student Interest",
      value: "Robotics, coding, innovation",
      icon: Zap,
      color: "bg-amber-100 text-amber-600",
    },
    {
      title: "Commitment",
      value: "8-12 weeks training program",
      icon: Calendar,
      color: "bg-purple-100 text-purple-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Header />

      <section className="relative min-h-auto lg:min-h-[calc(100svh-88px)] flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden pt-20">
        <div className="absolute inset-0 bg-gradient-to-br from-red-50 via-white to-red-50" />
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-red-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" />
          <div className="absolute top-40 right-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
            <div className="text-center lg:text-left space-y-6">
              <Badge
                variant="default"
                className="bg-[#ffecec] text-[#c40000] hover:bg-[#ffe3e3] text-sm font-semibold py-1.5 px-4 border border-red-200 rounded-full shadow-sm"
              >
                <Trophy className="h-4 w-4 mr-2" /> {competitionData.level}
              </Badge>

              <div className="space-y-5">
                <h1 className="text-2xl md:text-4xl xl:text-5xl font-bold text-gray-900 leading-tight">
                  <span className="block text-gray-900 font-extrabold">
                    Build, Compete and Win
                  </span>
                  <span className="block gradient-text text-xl md:text-2xl xl:text-3xl ">
                    Indian Robotics Olympiad (IRO)
                  </span>
                </h1>

                <div className="max-w-2xl mx-auto lg:mx-0 space-y-3">
                  <p className="text-lg md:text-xl text-gray-700">
                    Structured robotics coaching for national competitions.
                  </p>
                  <ul className="text-sm md:text-base text-gray-700 space-y-1.5">
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-red-600 mt-0.5" />
                      <span>Hands-on robot building</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-red-600 mt-0.5" />
                      <span>Mock competition rounds</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-red-600 mt-0.5" />
                      <span>Presentation and judging preparation</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button
                  size="lg"
                  aria-label="Start IRO training enrollment"
                  className="text-base sm:text-lg px-7 py-5 text-white bg-red-700 hover:bg-red-800 hover:shadow-2xl transition-all duration-300 rounded-full group"
                >
                  Train for IRO
                  <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  aria-label="View IRO student achievements"
                  className="text-base sm:text-lg px-7 py-5 border-2 border-red-700 text-red-700 hover:bg-red-800 hover:text-white transition-all duration-300 rounded-full"
                  onClick={scrollToTimeline}
                >
                  View Achievements
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto lg:mx-0">
                {quickStats.map((stat) => (
                  <div
                    key={stat.label}
                    className="bg-white/90 rounded-2xl border border-gray-200 px-4 py-4 text-center shadow-sm transition-transform duration-200 hover:-translate-y-1"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <stat.icon className="h-5 w-5 text-red-600" />
                      <p className="text-[28px] font-bold text-gray-900 leading-none">
                        {stat.value}
                      </p>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">{stat.label}</p>
                  </div>
                ))}
              </div>

              <p className="text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3 inline-block">
                Limited seats for IRO 2026 preparation batch. Next batch starts
                soon.
              </p>
            </div>

            <div className="relative lg:max-h-[70vh]">
              <div className="relative bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.08)]">
                <div className="relative h-72 sm:h-80 md:h-[430px] rounded-2xl overflow-hidden">
                  <Image
                    src="/assets/competition/iro/iro1.avif"
                    alt="Students presenting their robot at Indian Robotics Olympiad finals"
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover object-center transition-transform duration-500 hover:scale-[1.02]"
                  />
                </div>

                <div className="absolute top-5 right-5 ">
                  <Image
                    src={competitionData.logo}
                    alt="Indian Robotics Olympiad logo"
                    width={80}
                    height={80}
                    className="object-contain "
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-sm md:text-base text-gray-700 font-medium">
            Trusted by 100+ students | National Award Winners | Robotics
            Competition Champions
          </p>
        </div>
      </section>

      <section
        ref={timelineRef}
        id="achievements-timeline"
        className="py-2 bg-white"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Timeline
            data={[
              {
                title: "2024",
                content: (
                  <div className="bg-white p-6 rounded-xl shadow-lg border border-blue-100">
                    <Image
                      src="/assets/competition/iro/iro3.jpg"
                      alt="Indian Robotics Olympiad 2024 winners and robots"
                      width={400}
                      height={400}
                      sizes="(max-width: 768px) 100vw, 700px"
                      className="rounded-2xl w-full h-96 object-cover border border-gray-200 bg-white mb-4"
                    />
                    <h3 className="text-xl font-bold text-red-600 mb-3">
                      Indian Robotics Olympiad 2024
                    </h3>
                    <p className="text-gray-700 mb-2 flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-yellow-500" />
                      <span>1st Place - Techies Category</span>
                    </p>
                    <p className="text-gray-700 mb-2 flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-amber-600" />
                      <span>3rd Place - Techies Category</span>
                    </p>
                    <p className="text-gray-700 mb-2 flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-amber-600" />
                      <span>3rd Place - Innovators Category</span>
                    </p>
                    <p className="text-gray-700 flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-blue-600" />
                      <span>National Finals</span>
                    </p>
                  </div>
                ),
              },
              {
                title: "2025",
                content: (
                  <div className="bg-white p-6 rounded-xl shadow-lg border border-blue-100">
                    <Image
                      src="/assets/competition/iro/iro1.avif"
                      alt="Indian Robotics Olympiad 2025 first place celebration"
                      width={400}
                      height={400}
                      sizes="(max-width: 768px) 100vw, 700px"
                      className="rounded-2xl w-full h-96 object-cover border border-gray-200 bg-white mb-4"
                    />
                    <h3 className="text-xl font-bold text-blue-600 mb-3">
                      Indian Robotics Olympiad 2025
                    </h3>
                    <p className="text-gray-700 mb-2 flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-yellow-500" />
                      <span>1st Place - Innovators Category</span>
                    </p>
                    <p className="text-gray-700 flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-blue-600" />
                      <span>National Finals</span>
                    </p>
                  </div>
                ),
              },
            ]}
          />
        </div>
      </section>

      <section className="py-16 md:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 md:mb-12">
            <h2 className="text-2xl md:text-3xl font-bold gradient-text mb-4">
              Competition Overview
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Key details parents and students need before starting the IRO
              journey.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {overviewData.map((item) => (
              <InfoCard key={item.title} item={item} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why IRO Matters
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Practical competition exposure that transforms classroom learning
              into real engineering confidence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {valueData.map((value) => (
              <div
                key={value}
                className="bg-gray-50 p-6 rounded-xl shadow-sm border border-gray-100"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
                      <Check className="h-4 w-4 text-red-600" />
                    </div>
                  </div>
                  <p className="text-gray-700">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold gradient-text mb-4">
              Awards and Recognition
            </h2>
            <p className="text-lg text-gray-600">
              Verified podium performance at IRO across categories.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {awards.map((award) => (
              <AwardCard key={award.id} award={award} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold gradient-text mb-4">
              Skills Students Develop
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Hands-on competition training that builds technical and life
              skills.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {skillsDeveloped.map((skill) => (
              <Card key={skill} className="border-gray-100 h-full">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="h-4 w-4 text-red-600" />
                    </div>
                    <p className="text-gray-700">{skill}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold gradient-text mb-4">
              Who Should Join IRO
            </h2>
            <p className="text-lg text-gray-600">
              A quick fit-check for parents evaluating national competition
              training.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {eligibilityData.map((item) => {
              const Icon = item.icon;
              return (
                <Card key={item.title} className="border-gray-100">
                  <CardContent className="p-6 flex items-start gap-4">
                    <div
                      className={`w-12 h-12 rounded-full ${item.color} flex items-center justify-center flex-shrink-0`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900 mb-1">
                        {item.title}
                      </h3>
                      <p className="text-gray-700">{item.value}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-24 bg-gradient-to-r from-red-600 to-red-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Train Your Child for National Robotics Competitions
          </h2>
          <p className="text-xl text-red-100 mb-4 max-w-2xl mx-auto">
            Join a proven IRO preparation program with national podium results.
          </p>
          <p className="text-base text-white/90 mb-10">
            Limited seats available for the IRO 2026 preparation batch.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              aria-label="Enroll in IRO coaching batch"
              className="bg-white text-red-600 hover:bg-gray-100 text-lg px-8 py-6 hover:shadow-lg transition-all"
            >
              Enroll Now <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              aria-label="Talk to IRO mentor"
              className="border-white text-white hover:bg-white hover:text-red-600 text-lg px-8 py-6 hover:shadow-lg transition-all"
            >
              Talk to Mentor
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default IROPage;
