"use client";
import Header from "@/components/layout/header";
import { Timeline } from "@/components/ui/timeline";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Trophy,
  Users,
  Target,
  Calendar,
  Award,
  Zap,
  Brain,
  Star,
  ChevronRight,
  MapPin,
  Clock,
} from "lucide-react";
import Image from "next/image";
import { useRef, useEffect } from "react";

const IROPage = () => {
  // Competition data
  const competitionData = {
    name: "Indian Robotics Olympiad (IRO)",
    level: "National Level Competition",
    years: "2024 & 2025",
    achievement: "Winners at National Level",
    logo: "/assets/awards/IRO.png",
  };

  // Ref for achievements timeline
  const timelineRef = useRef<HTMLDivElement>(null);

  // Log when component mounts
  useEffect(() => {
    console.log("Component mounted, timelineRef:", timelineRef.current);
  }, []);

  // Log when ref updates
  useEffect(() => {
    if (timelineRef.current) {
      console.log("Timeline ref updated:", timelineRef.current);
    }
  });

  // Scroll to achievements timeline function
  const scrollToTimeline = () => {
    console.log("Scroll function called");
    setTimeout(() => {
      // Try using ref first
      if (timelineRef.current) {
        console.log("Element found via ref:", timelineRef.current);
        const rect = timelineRef.current.getBoundingClientRect();
        const scrollTop =
          window.pageYOffset || document.documentElement.scrollTop;
        const elementTop = rect.top + scrollTop;
        const offsetPosition = elementTop - 100; // Subtract 100px for header offset

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
      } else {
        // Fallback to DOM method
        const element = document.getElementById("achievements-timeline");
        console.log("Element found via ID:", element);
        if (element) {
          const rect = element.getBoundingClientRect();
          const scrollTop =
            window.pageYOffset || document.documentElement.scrollTop;
          const elementTop = rect.top + scrollTop;
          const offsetPosition = elementTop - 100; // Subtract 100px for header offset

          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth",
          });
        }
      }
    }, 10); // Small delay to ensure DOM is ready
  };

  const overviewData = [
    {
      icon: Users,
      title: "Organizer",
      description: "Indian Robotics Olympiad Committee",
    },
    {
      icon: Target,
      title: "Objective",
      description: "Robotics + Innovation + Problem Solving",
    },
    {
      icon: Zap,
      title: "Format",
      description: "Design → Build → Compete",
    },
    {
      icon: Users,
      title: "Categories",
      description: "Junior / Senior",
    },
    {
      icon: Star,
      title: "Level",
      description: "National",
    },
  ];

  const valueData = [
    "Enhances logical thinking & engineering mindset",
    "Introduces real-world problem solving",
    "Builds confidence in national-level exposure",
    "Develops systematic approach to challenges",
    "Prepares students for future STEM careers",
  ];

  const participationHistory = [
    {
      year: "2024",
      category: "Junior Category",
      teams: "4 teams participated",
      result: "🥇 National Winner",
      highlight: true,
    },
    {
      year: "2025",
      category: "Junior + Intermediate",
      teams: "6 teams",
      result: "🥈 Runner-up | 🏆 Judges' Award",
      highlight: true,
    },
  ];

  const awards = [
    {
      id: 1,
      src: "/assets/awards/IRO.png",
      alt: "IRO 2024 Championship",
      year: "2024",
      title: "National Champions",
    },
    {
      id: 2,
      src: "/assets/awards/IRO.png",
      alt: "IRO 2025 Runner-up",
      year: "2025",
      title: "National Runner-up",
    },
    {
      id: 3,
      src: "/assets/awards/Judges-awards.png",
      alt: "IRO 2025 Judges Award",
      year: "2025",
      title: "Judges' Special Award",
    },
  ];

  const studentProjects = [
    {
      name: "Line Following Robot",
      description: "Precision navigation using IR sensors",
      sensors: ["IR Sensors", "Color Sensors"],
      concepts: ["PID Tuning", "Speed Optimization"],
      scoring: "Accuracy-based competition",
    },
    {
      name: "Obstacle Avoidance Robot",
      description: "Autonomous navigation system",
      sensors: ["Ultrasonic Sensors", "Gyro Sensors"],
      concepts: ["Path Planning", "Real-time Decision Making"],
      scoring: "Efficiency & Time-based",
    },
    {
      name: "Maze Solving Robot",
      description: "Intelligent pathfinding algorithms",
      sensors: ["IR Array", "Compass Sensor"],
      concepts: ["Wall Following Algorithm", "Flood Fill Algorithm"],
      scoring: "Shortest Path Optimization",
    },
  ];

  const preparationSteps = [
    "Competition briefing & rules understanding",
    "Concept learning: Sensors, actuators, programming",
    "Robot design & prototyping phase",
    "Testing & debugging iterations",
    "Mock competitions & strategy refinement",
    "Final competition readiness & presentation prep",
  ];

  const skillsDeveloped = {
    technical: [
      "Robotics design and mechanical engineering",
      "Sensor calibration and integration",
      "Programming logic and algorithm development",
      "Circuit design and electronics fundamentals",
      "3D modeling and rapid prototyping",
    ],
    soft: [
      "Teamwork and collaboration",
      "Time management under pressure",
      "Problem-solving methodology",
      "Presentation and communication",
      "Project planning and execution",
    ],
    mindset: [
      "Engineering thinking approach",
      "Iterative development mindset",
      "Resilience in face of challenges",
      "Innovation and creativity",
      "Attention to detail and precision",
    ],
  };

  const eligibility = {
    age: "9-14 years",
    level: "Beginner to Intermediate",
    prerequisites: "Interest in robotics and problem-solving",
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Header />

      {/* Modern Hero Section - Content Left, Image Right */}
      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden mt-7">
        {/* Animated background elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-50 via-white to-red-50"></div>
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-red-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left Content Side */}
            <div className="text-center lg:text-left space-y-8">
              <div className="inline-flex items-center gap-3">
                <Badge
                  variant="default"
                  className="bg-red-100 text-red-800 hover:bg-red-200 text-lg py-3 px-6 border-red-200 rounded-full shadow-lg"
                >
                  🏆 {competitionData.level}
                </Badge>
              </div>

              <div className="space-y-6">
                <h1 className="text-5xl md:text-7xl font-bold text-gray-900 leading-tight">
                  {competitionData.name.split(" ").map((word, index) => (
                    <span
                      key={index}
                      className={index === 0 ? "gradient-text" : ""}
                    >
                      {word}{" "}
                    </span>
                  ))}
                </h1>

                <div
                  className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:-translate-y-2 cursor-pointer"
                  onClick={() => setTimeout(() => scrollToTimeline(), 10)}
                >
                  <div className="  ">
                    <div className="flex items-center gap-4">
                      <div className="w-4 h-4 rounded-full bg-green-500 animate-pulse"></div>
                      <p className="text-2xl font-semibold text-gray-800">
                        {competitionData.achievement}
                      </p>
                    </div>
                    <p className="text-xl text-gray-600 pl-8">
                      {competitionData.years}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button
                  size="lg"
                  className="text-lg px-8 py-6 text-white bg-red-700 hover:bg-red-800 hover:shadow-2xl transition-all duration-300 rounded-full group"
                >
                  Train for IRO
                  <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 py-6 border-2 border-red-700 text-red-700 hover:bg-red-800 hover:text-white transition-all duration-300 rounded-full"
                  onClick={() => setTimeout(() => scrollToTimeline(), 10)}
                >
                  View Achievements
                </Button>
              </div>
            </div>

            {/* Right Image Side - No Padding */}
            <div className="relative group">
              <div className="relative bg-white rounded-3xl  border border-gray-100 overflow-hidden">
                <div className="relative z-10">
                  <div className="relative h-96 md:h-[500px] rounded-2xl overflow-hidden">
                    <Image
                      src="/assets/competition/iro-image1.png"
                      alt="IRO National Champions Trophy"
                      fill
                      className="object-contain "
                    />
                  </div>

                  {/* Bottom stats card */}
                  <div
                    className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-white rounded-3xl p-6 shadow-xl border border-gray-100 w-4/5 cursor-pointer hover:shadow-2xl transition-shadow"
                    onClick={() => setTimeout(() => scrollToTimeline(), 10)}
                  >
                    <div className="flex justify-between items-center">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">
                          10+
                        </div>
                        <div className="text-sm text-gray-600">
                          Teams Trained
                        </div>
                      </div>
                      <div className="text-3xl">🤖</div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          2
                        </div>
                        <div className="text-sm text-gray-600">
                          Years Winning
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Competition Overview */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold gradient-text mb-4">
              Competition Overview
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Understanding what makes IRO a premier national robotics
              competition
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {overviewData.map((item, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                    <item.icon className="h-6 w-6 text-red-600" />
                  </div>
                  <CardTitle className="text-xl">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why This Competition Matters */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why IRO Matters
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Beyond trophies - building future engineers and innovators
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {valueData.map((value, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
                      <span className="text-red-600 font-bold text-sm">✓</span>
                    </div>
                  </div>
                  <p className="text-gray-700">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Participation History */}
      <section
        ref={timelineRef}
        id="achievements-timeline"
        className="py-16 bg-white"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="w-full">
            <Timeline
              data={[
                {
                  title: "2024",
                  content: (
                    <div className="bg-white p-6 rounded-xl shadow-lg border border-red-100">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <Image
                          src=""
                          alt="IRO 2024 National Champions"
                          width={400}
                          height={400}
                          className="rounded-lg w-full h-52 object-cover border border-gray-200"
                        />
                        <Image
                          src="https://placehold.co/400x200/ffffff/000000?text=IRO+2024+Team"
                          alt="IRO 2024 Winning Team"
                          width={400}
                          height={400}
                          className="rounded-lg w-full h-52 object-cover border border-gray-200"
                        />
                      </div>
                      <h3 className="text-xl font-bold text-red-600 mb-3">
                        National Champions
                      </h3>
                      <p className="text-gray-700 mb-2">
                        <strong>Category:</strong> Junior Category
                      </p>
                      <p className="text-gray-700 mb-2">
                        <strong>Teams:</strong> 4 teams participated
                      </p>
                      <p className="text-gray-700">
                        <strong>Result:</strong> 🥇 National Winner
                      </p>
                    </div>
                  ),
                },
                {
                  title: "2025",
                  content: (
                    <div className="bg-white p-6 rounded-xl shadow-lg border border-blue-100">
                      <div className="">
                        <Image
                          src="/assets/competition/iro/iro1.avif"
                          alt="IRO 2025 National Runners-up"
                          width={400}
                          height={400}
                          className="rounded-lg w-full h-96 object-cover border border-gray-200"
                        />
                      </div>
                      <h3 className="text-xl font-bold text-blue-600 mb-3">
                        National Runners-up
                      </h3>
                      <p className="text-gray-700 mb-2">
                        <strong>Category:</strong> Junior + Intermediate
                      </p>
                      <p className="text-gray-700 mb-2">
                        <strong>Teams:</strong> 6 teams
                      </p>
                      <p className="text-gray-700">
                        <strong>Result:</strong> 🥈 Runner-up | 🏆 Judges' Award
                      </p>
                    </div>
                  ),
                },
              ]}
            />
          </div>
        </div>
      </section>

      {/* Awards & Certificates */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Awards & Recognition
            </h2>
            <p className="text-xl text-gray-600">
              Visual proof of our students' excellence
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {awards.map((award) => (
              <Card
                key={award.id}
                className="overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="relative h-48 bg-gray-100">
                  <Image
                    src={award.src}
                    alt={award.alt}
                    fill
                    className="object-contain p-4"
                  />
                </div>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-2">{award.title}</h3>
                  <p className="text-gray-600">{award.year}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Student Projects */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Student Projects
            </h2>
            <p className="text-xl text-gray-600">
              What our students actually build and program
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {studentProjects.map((project, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-xl text-red-600">
                    {project.name}
                  </CardTitle>
                  <p className="text-gray-600">{project.description}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Key Components:</h4>
                    <div className="flex flex-wrap gap-2">
                      {project.sensors.map((sensor, idx) => (
                        <Badge key={idx} variant="secondary">
                          {sensor}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">
                      Programming Concepts:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {project.concepts.map((concept, idx) => (
                        <Badge key={idx} className="bg-red-100 text-red-800">
                          {concept}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="pt-4 border-t">
                    <p className="text-sm text-gray-500">
                      Competition Focus: {project.scoring}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Preparation Process */}
      <section className="py-16 bg-red-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How We Prepare Students
            </h2>
            <p className="text-xl text-gray-600">
              Systematic approach to competition success
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="space-y-4">
              {preparationSteps.map((step, index) => (
                <div
                  key={index}
                  className="flex items-start gap-4 bg-white p-6 rounded-xl shadow-sm"
                >
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center">
                      <span className="text-white font-bold">{index + 1}</span>
                    </div>
                  </div>
                  <p className="text-gray-700 pt-1">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Skills Development */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Skills Students Develop
            </h2>
            <p className="text-xl text-gray-600">
              Transforming competition experience into lifelong capabilities
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-red-600" />
                  Technical Skills
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {skillsDeveloped.technical.map((skill, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-red-600 mt-1">•</span>
                      <span className="text-gray-700">{skill}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-red-600" />
                  Soft Skills
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {skillsDeveloped.soft.map((skill, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-red-600 mt-1">•</span>
                      <span className="text-gray-700">{skill}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-red-600" />
                  Mindset
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {skillsDeveloped.mindset.map((skill, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-red-600 mt-1">•</span>
                      <span className="text-gray-700">{skill}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Eligibility */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Who Should Join IRO
            </h2>
            <p className="text-xl text-gray-600">
              Perfect for students ready to take on national-level challenges
            </p>
          </div>

          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Age Group</h3>
                  <p className="text-gray-700">{eligibility.age}</p>
                </div>

                <div>
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                    <Star className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Skill Level</h3>
                  <p className="text-gray-700">{eligibility.level}</p>
                </div>

                <div>
                  <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4">
                    <Target className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Prerequisites</h3>
                  <p className="text-gray-700">{eligibility.prerequisites}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-r from-red-600 to-red-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Train Your Child for National Robotics Competitions
          </h2>
          <p className="text-xl text-red-100 mb-10 max-w-2xl mx-auto">
            Join our proven program that has produced national winners. Give
            your child the competitive edge in robotics.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-red-600 hover:bg-gray-100 text-lg px-8 py-6 hover:shadow-lg transition-all"
            >
              Enroll Now <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
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
