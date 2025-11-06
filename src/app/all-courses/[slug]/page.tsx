// Server Component - no "use client" directive needed
import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";

import Image from "next/image";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import Footer from "@/components/home/Footer";
import Testimonials from "@/components/ui/course-accordion";

// Import curriculum data
import {
  javaCurriculum,
  MachineLearningCurriculum,
  AnimationAndCodingCurriculum,
  ThreeDPrintingCurriculum,
  AndroidCurriculum,
  AppDevelopmentData,
  AppLabCurriculum,
  ArduinoCurriculum,
  ArtificialIntelligenceCurriculum,
  BambinoCodingCurriculum,
  EarlySimplemachineCurriculum,
  IotCurriculum,
  pythonCourseData,
  RoboticsCurriculum,
  SimplePoweredMachines,
  SpikePneumatics,
  SpikePrimeCurriculum,
  WebDesignCurriculum,
} from "../../../../utils/curriculum";

// Define the type for key features
interface KeyFeature {
  title: string;
  description: string;
  iconName: string;
}

// Define the type for our mock data
interface CourseData {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  description: string;
  mode: string;
  duration: string;
  syllabusPath: string;
  syllabusFileName: string;
  imagePath: string;
  imageAlt: string;
  price: number;
  originalPrice: number;
  currency: string;
  locale: string;
  keyFeatures: KeyFeature[];
  content?: string;
}

// Define the type for curriculum data
interface CurriculumLevel {
  id: string;
  title: string;
  subtitle: string[];
}

// Mock data with slugs as keys
const mockData: Record<string, CourseData> = {
  "python-language": {
    id: "python",
    title: "Python Programming",
    subtitle:
      "Learn the world's fastest-growing programming language for web development, data science, AI and more",
    badge: "Most Popular Course",
    description:
      "Learn the world's fastest-growing programming language for web development, data science, AI and more",
    mode: "Online & Offline",
    duration: "16 CLASSES(x6 LEVELS) (1 HOUR PER CLASS)",
    syllabusPath: "/assets/pdf/PYTHON.pdf",
    syllabusFileName: "PYTHON.pdf",
    imagePath: "/assets/online-course/python.webp",
    imageAlt: "Python Programming Course",
    price: 14999,
    originalPrice: 24999,
    currency: "INR",
    locale: "en-IN",
    keyFeatures: [
      {
        title: "Core Programming",
        description:
          "Master fundamental programming concepts and Python syntax",
        iconName: "Code",
      },
      {
        title: "Web Development",
        description:
          "Build websites and web applications using Python frameworks",
        iconName: "Globe",
      },
      {
        title: "Data Analysis",
        description:
          "Process, analyze and visualize data with Python libraries",
        iconName: "LineChart",
      },
      {
        title: "AI & Machine Learning",
        description:
          "Create intelligent applications with Python ML frameworks",
        iconName: "BrainCircuit",
      },
    ],
  },
  arduino: {
    id: "arduino",
    title: "Arduino",
    subtitle:
      "Build interactive electronics projects with Arduino programming and hardware integration",
    badge: "Electronics Course",
    description:
      "Build interactive electronics projects with Arduino programming and hardware integration",
    mode: "Offline",
    duration: "16 CLASSES (1 HOUR PER CLASS)",
    syllabusPath: "/assets/pdf/ARDUINO.pdf",
    syllabusFileName: "ARDUINO.pdf",
    imagePath: "/assets/classroom-course/arduino.webp",
    imageAlt: "Arduino Course",
    price: 8999,
    originalPrice: 12999,
    currency: "INR",
    locale: "en-IN",
    keyFeatures: [
      {
        title: "Hardware Programming",
        description: "Learn to program Arduino microcontrollers using C/C++",
        iconName: "Cpu",
      },
      {
        title: "Circuit Design",
        description: "Build electronic circuits and connect various components",
        iconName: "CircuitBoard",
      },
      {
        title: "Sensor Integration",
        description:
          "Interface with real-world sensors to collect and process data",
        iconName: "Zap",
      },
      {
        title: "IoT Projects",
        description: "Create interactive projects and automated solutions",
        iconName: "Lightbulb",
      },
    ],
  },
  "web-designing": {
    id: "webDesigning",
    title: "Web Designing",
    subtitle:
      "Learn to build beautiful, responsive and interactive websites with HTML and CSS",
    badge: "Frontend Development Course",
    description:
      "Learn to build beautiful, responsive and interactive websites with HTML and CSS",
    mode: "Online & Offline",
    duration: "16 CLASSES (x4 LEVELS) (1 HOUR PER CLASS)",
    syllabusPath: "/assets/pdf/WEB DESIGN.pdf",
    syllabusFileName: "WEB DESIGN.pdf",
    imagePath: "/assets/online-course/webdesigning.webp",
    imageAlt: "Web Designing Course",
    price: 10999,
    originalPrice: 15999,
    currency: "INR",
    locale: "en-IN",
    keyFeatures: [
      {
        title: "HTML Fundamentals",
        description:
          "Learn the core building blocks of website structure and content",
        iconName: "Code",
      },
      {
        title: "CSS Styling",
        description:
          "Master styling techniques to create visually appealing websites",
        iconName: "Palette",
      },
      {
        title: "Responsive Design",
        description:
          "Create websites that adapt to different screen sizes and devices",
        iconName: "Layout",
      },
      {
        title: "Interactive Elements",
        description:
          "Add engaging features and interactive components to web pages",
        iconName: "Rocket",
      },
    ],
  },
  java: {
    id: "java",
    title: "JAVA PROGRAMMING",
    subtitle:
      "Master object-oriented programming with Java for enterprise applications and Android development",
    badge: "Enterprise Programming Course",
    description:
      "Master object-oriented programming with Java for enterprise applications and Android development",
    mode: "Online & Offline",
    duration: "16 CLASSES (x4 LEVELS) (1 HOUR PER CLASS)",
    syllabusPath: "/assets/pdf/JAVA.pdf",
    syllabusFileName: "JAVA.pdf",
    imagePath: "/assets/online-course/java.webp",
    imageAlt: "Java Programming Course",
    price: 15999,
    originalPrice: 21999,
    currency: "INR",
    locale: "en-IN",
    keyFeatures: [
      {
        title: "Object-Oriented Programming",
        description:
          "Learn OOP concepts like inheritance, polymorphism, and encapsulation",
        iconName: "Code",
      },
      {
        title: "Enterprise Development",
        description: "Build scalable applications for enterprise environments",
        iconName: "Database",
      },
      {
        title: "Android Development",
        description:
          "Create mobile applications using Java for Android platform",
        iconName: "Smartphone",
      },
      {
        title: "Advanced Java Features",
        description: "Master collections, multithreading, and Java frameworks",
        iconName: "Settings",
      },
    ],
  },

  "android-studio": {
    id: "androidStudio",
    title: "ANDROID STUDIO",
    subtitle:
      "Build professional Android applications using Android Studio and modern development practices",
    badge: "Mobile Development Course",
    description:
      "Build professional Android applications using Android Studio and modern development practices",
    mode: "Online & Offline",
    duration: "16 CLASSES (x4 LEVELS) (1 HOUR PER CLASS)",
    syllabusPath: "/assets/pdf/ANDROID STUDIO.pdf",
    syllabusFileName: "ANDROID STUDIO.pdf",
    imagePath: "/assets/classroom-course/androidstudio.png",
    imageAlt: "Android Studio Course",
    price: 13999,
    originalPrice: 19999,
    currency: "INR",
    locale: "en-IN",
    keyFeatures: [
      {
        title: "Android Development",
        description:
          "Learn to build native Android applications using Java/Kotlin",
        iconName: "Smartphone",
      },
      {
        title: "UI/UX Design",
        description:
          "Create beautiful and intuitive user interfaces for mobile apps",
        iconName: "Layout",
      },
      {
        title: "App Publishing",
        description: "Learn to publish your apps on Google Play Store",
        iconName: "Rocket",
      },
      {
        title: "Modern Android Features",
        description: "Implement latest Android features and best practices",
        iconName: "Star",
      },
    ],
  },
  "machine-learning": {
    id: "machineLearning",
    title: "MACHINE LEARNING",
    subtitle:
      "Master the fundamentals of machine learning and build intelligent applications",
    badge: "AI & Data Science Course",
    description:
      "Master the fundamentals of machine learning and build intelligent applications",
    mode: "Online & Offline",
    duration: "16 CLASSES (x4 LEVELS) (1 HOUR PER CLASS)",
    syllabusPath: "/assets/pdf/MACHINE LEARNING.pdf",
    syllabusFileName: "MACHINE LEARNING.pdf",
    imagePath: "/assets/online-course/machine-learning.webp",
    imageAlt: "Machine Learning Course",
    price: 18999,
    originalPrice: 25999,
    currency: "INR",
    locale: "en-IN",
    keyFeatures: [
      {
        title: "ML Fundamentals",
        description: "Learn core machine learning concepts and algorithms",
        iconName: "BrainCircuit",
      },
      {
        title: "Data Processing",
        description:
          "Master data preprocessing and feature engineering techniques",
        iconName: "Database",
      },
      {
        title: "Model Training",
        description: "Train and evaluate machine learning models effectively",
        iconName: "LineChart",
      },
      {
        title: "Real-world Applications",
        description: "Build practical ML applications for various domains",
        iconName: "Rocket",
      },
    ],
  },
  "artificial-intelligence": {
    id: "artificialIntelligence",
    title: "ARTIFICIAL INTELLIGENCE",
    subtitle:
      "Explore the cutting-edge world of AI and build intelligent systems",
    badge: "Advanced AI Course",
    description:
      "Explore the cutting-edge world of AI and build intelligent systems",
    mode: "Online & Offline",
    duration: "16 CLASSES (x4 LEVELS) (1 HOUR PER CLASS)",
    syllabusPath: "/assets/pdf/ARTIFICIAL INTELLIGENCE.pdf",
    syllabusFileName: "ARTIFICIAL INTELLIGENCE.pdf",
    imagePath: "/assets/online-course/aigif.webp",
    imageAlt: "Artificial Intelligence Course",
    price: 19999,
    originalPrice: 28999,
    currency: "INR",
    locale: "en-IN",
    keyFeatures: [
      {
        title: "AI Fundamentals",
        description:
          "Understand core AI concepts and problem-solving approaches",
        iconName: "BrainCircuit",
      },
      {
        title: "Neural Networks",
        description: "Build and train deep neural networks for complex tasks",
        iconName: "Network",
      },
      {
        title: "Computer Vision",
        description: "Implement AI systems that can see and understand images",
        iconName: "Eye",
      },
      {
        title: "Natural Language Processing",
        description:
          "Create AI systems that understand and generate human language",
        iconName: "MessageSquare",
      },
    ],
  },
  "robotics-ev3": {
    id: "roboticsEv3",
    title: "ROBOTICS EV3",
    subtitle: "Build and program intelligent robots using LEGO Mindstorms EV3",
    badge: "Robotics Course",
    description:
      "Build and program intelligent robots using LEGO Mindstorms EV3",
    mode: "Offline",
    duration: "16 CLASSES (x4 LEVELS) (1 HOUR PER CLASS)",
    syllabusPath: "/assets/pdf/EV3 ROBOTICS.pdf",
    syllabusFileName: "ROBOTICS EV3.pdf",
    imagePath: "/assets/classroom-course/ev3.webp",
    imageAlt: "Robotics EV3 Course",
    price: 11999,
    originalPrice: 16999,
    currency: "INR",
    locale: "en-IN",
    keyFeatures: [
      {
        title: "Robot Building",
        description:
          "Learn mechanical engineering principles through hands-on robot construction",
        iconName: "Bot",
      },
      {
        title: "Programming Robots",
        description:
          "Program robots to perform complex tasks and solve problems",
        iconName: "Code",
      },
      {
        title: "Sensor Integration",
        description:
          "Use various sensors to make robots aware of their environment",
        iconName: "Zap",
      },
      {
        title: "Competition Ready",
        description: "Prepare for robotics competitions and challenges",
        iconName: "Trophy",
      },
    ],
  },
  "spike-prime": {
    id: "spikePrime",
    title: "SPIKE PRIME",
    subtitle: "Learn robotics and coding with LEGO Education SPIKE Prime",
    badge: "Educational Robotics Course",
    description: "Learn robotics and coding with LEGO Education SPIKE Prime",
    mode: "Offline",
    duration: "16 CLASSES (x4 LEVELS) (1 HOUR PER CLASS)",
    syllabusPath: "/assets/pdf/Spike Prime.pdf",
    syllabusFileName: "SPIKE PRIME.pdf",
    imagePath: "/assets/classroom-course/pneumatics.webp",
    imageAlt: "SPIKE Prime Course",
    price: 9999,
    originalPrice: 14999,
    currency: "INR",
    locale: "en-IN",
    keyFeatures: [
      {
        title: "Block-based Programming",
        description:
          "Learn programming concepts using intuitive drag-and-drop blocks",
        iconName: "Blocks",
      },
      {
        title: "STEAM Learning",
        description:
          "Integrate Science, Technology, Engineering, Arts, and Mathematics",
        iconName: "GraduationCap",
      },
      {
        title: "Creative Problem Solving",
        description:
          "Develop critical thinking through hands-on robotics projects",
        iconName: "Lightbulb",
      },
      {
        title: "Real-world Applications",
        description: "Apply robotics concepts to solve everyday problems",
        iconName: "Rocket",
      },
    ],
  },
  "3d-printing": {
    id: "printing3d",
    title: "3D PRINTING",
    subtitle:
      "Learn to design and print 3D objects using modern 3D printing technology",
    badge: "Digital Manufacturing Course",
    description:
      "Learn to design and print 3D objects using modern 3D printing technology",
    mode: "Offline",
    duration: "16 CLASSES (x4 LEVELS) (1 HOUR PER CLASS)",
    syllabusPath: "/assets/pdf/3D PRINTING.pdf",
    syllabusFileName: "3D PRINTING.pdf",
    imagePath: "/assets/classroom-course/printing3d.webp",
    imageAlt: "3D Printing Course",
    price: 8999,
    originalPrice: 13999,
    currency: "INR",
    locale: "en-IN",
    keyFeatures: [
      {
        title: "3D Design",
        description: "Learn to create 3D models using CAD software",
        iconName: "Printer",
      },
      {
        title: "Printing Technology",
        description:
          "Understand different 3D printing technologies and materials",
        iconName: "Cog",
      },
      {
        title: "Post-processing",
        description:
          "Learn techniques to finish and improve 3D printed objects",
        iconName: "Brush",
      },
      {
        title: "Project-based Learning",
        description:
          "Create practical projects from concept to finished product",
        iconName: "Rocket",
      },
    ],
  },
  "bambino-coding": {
    id: "bambinoCoding",
    title: "BAMBINO CODING",
    subtitle:
      "Introduce young minds to programming with fun, interactive coding activities",
    badge: "Kids Programming Course",
    description:
      "Introduce young minds to programming with fun, interactive coding activities",
    mode: "Online & Offline",
    duration: "16 CLASSES (x4 LEVELS) (1 HOUR PER CLASS)",
    syllabusPath: "/assets/pdf/BAMBINO CODING.pdf",
    syllabusFileName: "BAMBINO CODING.pdf",
    imagePath: "/assets/online-course/bambino.webp",
    imageAlt: "Bambino Coding Course",
    price: 6999,
    originalPrice: 9999,
    currency: "INR",
    locale: "en-IN",
    keyFeatures: [
      {
        title: "Block-based Programming",
        description: "Learn coding concepts using visual drag-and-drop blocks",
        iconName: "Blocks",
      },
      {
        title: "Creative Projects",
        description: "Build fun games, animations, and interactive stories",
        iconName: "Gamepad2",
      },
      {
        title: "Logical Thinking",
        description: "Develop problem-solving and critical thinking skills",
        iconName: "BrainCircuit",
      },
      {
        title: "Digital Literacy",
        description: "Prepare for the technology-driven future",
        iconName: "GraduationCap",
      },
    ],
  },
  electronics: {
    id: "electronics",
    title: "ELECTRONICS",
    subtitle:
      "Learn the fundamentals of electronic circuits and electronic components",
    badge: "Electronics Course",
    description:
      "Learn the fundamentals of electronic circuits and electronic components",
    mode: "Offline",
    duration: "16 CLASSES (x4 LEVELS) (1 HOUR PER CLASS)",
    syllabusPath: "/assets/pdf/ELECTRONICS.pdf",
    syllabusFileName: "ELECTRONICS.pdf",
    imagePath: "/assets/classroom-course/electronics.webp",
    imageAlt: "Electronics Course",
    price: 10999,
    originalPrice: 15999,
    currency: "INR",
    locale: "en-IN",
    keyFeatures: [
      {
        title: "Circuit Design",
        description: "Learn to design and build electronic circuits",
        iconName: "CircuitBoard",
      },
      {
        title: "Component Knowledge",
        description: "Understand resistors, capacitors, transistors, and more",
        iconName: "Cpu",
      },
      {
        title: "Practical Projects",
        description: "Build real electronic devices and gadgets",
        iconName: "Lightbulb",
      },
      {
        title: "Troubleshooting",
        description: "Learn to diagnose and fix electronic problems",
        iconName: "Zap",
      },
    ],
  },
  "animation-coding": {
    id: "animationCoding",
    title: "ANIMATION CODING",
    subtitle:
      "Create stunning animations and visual effects through programming",
    badge: "Creative Programming Course",
    description:
      "Create stunning animations and visual effects through programming",
    mode: "Online & Offline",
    duration: "16 CLASSES (x4 LEVELS) (1 HOUR PER CLASS)",
    syllabusPath: "/assets/pdf/ANIMATION AND CODING.pdf",
    syllabusFileName: "ANIMATION CODING.pdf",
    imagePath: "/assets/online-course/animation-coding.webp",
    imageAlt: "Animation Coding Course",
    price: 9499,
    originalPrice: 13999,
    currency: "INR",
    locale: "en-IN",
    keyFeatures: [
      {
        title: "Visual Programming",
        description: "Learn to create animations using code",
        iconName: "Code",
      },
      {
        title: "Creative Expression",
        description: "Express ideas through animated visuals",
        iconName: "Brush",
      },
      {
        title: "Interactive Graphics",
        description: "Build engaging interactive animations",
        iconName: "Rocket",
      },
      {
        title: "Digital Art",
        description: "Combine programming with artistic creativity",
        iconName: "Palette",
      },
    ],
  },
  "app-designing": {
    id: "appDesigning",
    title: "APP DESIGNING",
    subtitle:
      "Design beautiful and functional mobile applications with modern UI/UX principles",
    badge: "Mobile Design Course",
    description:
      "Design beautiful and functional mobile applications with modern UI/UX principles",
    mode: "Online & Offline",
    duration: "16 CLASSES (x4 LEVELS) (1 HOUR PER CLASS)",
    syllabusPath: "/assets/pdf/APP DESIGNING.pdf",
    syllabusFileName: "APP DESIGNING.pdf",
    imagePath: "/assets/online-course/appdesigning.webp",
    imageAlt: "App Designing Course",
    price: 11999,
    originalPrice: 17999,
    currency: "INR",
    locale: "en-IN",
    keyFeatures: [
      {
        title: "UI/UX Design",
        description: "Learn modern design principles and user experience",
        iconName: "Layout",
      },
      {
        title: "Mobile Interfaces",
        description: "Design intuitive mobile app interfaces",
        iconName: "Smartphone",
      },
      {
        title: "Prototyping",
        description: "Create interactive prototypes and wireframes",
        iconName: "Rocket",
      },
      {
        title: "Design Tools",
        description: "Master industry-standard design software",
        iconName: "Palette",
      },
    ],
  },
  "early-simple-machines": {
    id: "earlySimpleMachines",
    title: "EARLY SIMPLE MACHINES",
    subtitle:
      "Explore basic mechanical principles through hands-on building and experimentation",
    badge: "Mechanical Engineering Course",
    description:
      "Explore basic mechanical principles through hands-on building and experimentation",
    mode: "Offline",
    duration: "16 CLASSES (x4 LEVELS) (1 HOUR PER CLASS)",
    syllabusPath: "/assets/pdf/EARLY SIMPLE MACHINES.pdf",
    syllabusFileName: "EARLY SIMPLE MACHINES.pdf",
    imagePath: "/assets/classroom-course/earlysimple.webp",
    imageAlt: "Early Simple Machines Course",
    price: 7999,
    originalPrice: 11999,
    currency: "INR",
    locale: "en-IN",
    keyFeatures: [
      {
        title: "Mechanical Principles",
        description: "Learn fundamental concepts of simple machines",
        iconName: "Cog",
      },
      {
        title: "Hands-on Building",
        description: "Construct working models of simple machines",
        iconName: "Settings",
      },
      {
        title: "Problem Solving",
        description: "Apply mechanical concepts to solve challenges",
        iconName: "Lightbulb",
      },
      {
        title: "Engineering Basics",
        description: "Build foundation for advanced engineering concepts",
        iconName: "GraduationCap",
      },
    ],
  },
  iot: {
    id: "iot",
    title: "INTERNET OF THINGS (IoT)",
    subtitle:
      "Connect devices and create smart systems that communicate over the internet",
    badge: "Connected Technology Course",
    description:
      "Connect devices and create smart systems that communicate over the internet",
    mode: "Online & Offline",
    duration: "16 CLASSES (x4 LEVELS) (1 HOUR PER CLASS)",
    syllabusPath: "/assets/pdf/INTERNET OF THINGS.pdf",
    syllabusFileName: "IOT.pdf",
    imagePath: "/assets/classroom-course/iot.webp",
    imageAlt: "IoT Course",
    price: 16999,
    originalPrice: 23999,
    currency: "INR",
    locale: "en-IN",
    keyFeatures: [
      {
        title: "Device Connectivity",
        description: "Learn to connect devices to the internet",
        iconName: "Wifi",
      },
      {
        title: "Sensor Integration",
        description: "Work with various sensors and data collection",
        iconName: "Zap",
      },
      {
        title: "Smart Systems",
        description: "Create intelligent automated systems",
        iconName: "Bot",
      },
      {
        title: "Data Processing",
        description: "Process and analyze IoT data streams",
        iconName: "Database",
      },
    ],
  },
  "spike-pneumatics": {
    id: "spikePneumatics",
    title: "SPIKE PNEUMATICS",
    subtitle:
      "Learn pneumatic systems and air-powered mechanisms with LEGO Education SPIKE",
    badge: "Pneumatic Systems Course",
    description:
      "Learn pneumatic systems and air-powered mechanisms with LEGO Education SPIKE",
    mode: "Offline",
    duration: "16 CLASSES (x4 LEVELS) (1 HOUR PER CLASS)",
    syllabusPath: "/assets/pdf/Spike Essential and Pneumatics.pdf",
    syllabusFileName: "Spike Essential.pdf",
    imagePath: "/assets/classroom-course/pneumatics.webp",
    imageAlt: "SPIKE Pneumatics Course",
    price: 9499,
    originalPrice: 13999,
    currency: "INR",
    locale: "en-IN",
    keyFeatures: [
      {
        title: "Pneumatic Systems",
        description: "Learn air-powered mechanisms and controls",
        iconName: "Zap",
      },
      {
        title: "Air Pressure",
        description: "Understand pressure, flow, and air dynamics",
        iconName: "Cog",
      },
      {
        title: "Mechanical Design",
        description: "Design systems using pneumatic components",
        iconName: "Settings",
      },
      {
        title: "Automation",
        description: "Create automated pneumatic systems",
        iconName: "Bot",
      },
    ],
  },
  "simple-powered-machines": {
    id: "simplePoweredMachines",
    title: "SIMPLE POWERED MACHINES",
    subtitle: "Explore powered mechanical systems and motor-driven mechanisms",
    badge: "Powered Systems Course",
    description:
      "Explore powered mechanical systems and motor-driven mechanisms",
    mode: "Offline",
    duration: "16 CLASSES (x4 LEVELS) (1 HOUR PER CLASS)",
    syllabusPath: "/assets/pdf/SIMPLE AND POWER MACHINE.pdf",
    syllabusFileName: "SIMPLE AND POWER MACHINE.pdf",
    imagePath: "/assets/classroom-course/simple-powered-machines.webp",
    imageAlt: "Simple Powered Machines Course",
    price: 9999,
    originalPrice: 14999,
    currency: "INR",
    locale: "en-IN",
    keyFeatures: [
      {
        title: "Motor Systems",
        description: "Learn to work with electric motors and drives",
        iconName: "Zap",
      },
      {
        title: "Power Transmission",
        description: "Understand gears, belts, and power transfer",
        iconName: "Cog",
      },
      {
        title: "Mechanical Design",
        description: "Design powered mechanical systems",
        iconName: "Settings",
      },
      {
        title: "Control Systems",
        description: "Learn to control powered mechanisms",
        iconName: "Bot",
      },
    ],
  },
  "app-lab": {
    id: "appLab",
    title: "APP LAB",
    subtitle:
      "Create mobile applications using MIT App Inventor and block-based programming",
    badge: "Mobile App Development Course",
    description:
      "Create mobile applications using MIT App Inventor and block-based programming",
    mode: "Online & Offline",
    duration: "16 CLASSES (x4 LEVELS) (1 HOUR PER CLASS)",
    syllabusPath: "/assets/pdf/App Lab.pdf",
    syllabusFileName: "APP LAB.pdf",
    imagePath: "/assets/classroom-course/applab.png",
    imageAlt: "App Lab Course",
    price: 7499,
    originalPrice: 10999,
    currency: "INR",
    locale: "en-IN",
    keyFeatures: [
      {
        title: "Block-based Programming",
        description: "Learn programming using visual blocks",
        iconName: "Blocks",
      },
      {
        title: "Mobile App Development",
        description: "Create functional mobile applications",
        iconName: "Smartphone",
      },
      {
        title: "User Interface Design",
        description: "Design intuitive app interfaces",
        iconName: "Layout",
      },
      {
        title: "App Testing",
        description: "Test and debug mobile applications",
        iconName: "Rocket",
      },
    ],
  },
};

// Server Component - properly handle params according to Next.js docs
export default async function SlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  // In Next.js App Router, params is a Promise that needs to be awaited
  const resolvedParams = await params;
  const { slug } = resolvedParams;

  // Log for debugging - this is normal behavior, not an error
  console.log("Slug received:", slug);

  // Get data by slug
  const data = mockData[slug];

  // If no data found, show 404
  if (!data) {
    console.log("No data found for slug:", slug);
    notFound();
  }

  // Get curriculum data by slug
  const getCurriculumData = (slug: string): CurriculumLevel[] => {
    switch (slug) {
      case "python-language":
        return pythonCourseData;
      case "arduino":
        return ArduinoCurriculum;
      case "web-designing":
        return WebDesignCurriculum;
      case "java":
        return javaCurriculum;
      case "android-studio":
        return AndroidCurriculum;
      case "machine-learning":
        return MachineLearningCurriculum;
      case "artificial-intelligence":
        return ArtificialIntelligenceCurriculum;
      case "robotics-ev3":
        return RoboticsCurriculum;
      case "spike-prime":
        return SpikePrimeCurriculum;
      case "3d-printing":
        return ThreeDPrintingCurriculum;
      case "bambino-coding":
        return BambinoCodingCurriculum;
      case "electronics":
        return EarlySimplemachineCurriculum;
      case "animation-coding":
        return AnimationAndCodingCurriculum;
      case "app-designing":
        return AppDevelopmentData;
      case "early-simple-machines":
        return EarlySimplemachineCurriculum;
      case "iot":
        return IotCurriculum;
      case "spike-pneumatics":
        return SpikePneumatics;
      case "simple-powered-machines":
        return SimplePoweredMachines;
      case "app-lab":
        return AppLabCurriculum;
      default:
        // Return default curriculum data if no specific curriculum is found
        return [
          {
            id: "level1",
            title: "Foundation",
            subtitle: [
              "Introduction to programming concepts",
              "Variables, data types, and operators",
              "Control structures (if/else, loops)",
              "Functions and modules",
            ],
          },
          {
            id: "level2",
            title: "Intermediate",
            subtitle: [
              "Object-oriented programming",
              "Error handling and debugging",
              "File handling and data persistence",
              "Working with external libraries",
            ],
          },
          {
            id: "level3",
            title: "Advanced",
            subtitle: [
              "Database integration",
              "API development and consumption",
              "Testing and quality assurance",
              "Deployment and DevOps basics",
            ],
          },
        ];
    }
  };

  // Get curriculum data for this course
  const curriculumData = getCurriculumData(slug);

  // Icon component mapping
  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case "Code":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="16 18 22 12 16 6" />
            <polyline points="8 6 2 12 8 18" />
          </svg>
        );
      case "Globe":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
        );
      case "LineChart":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
          </svg>
        );
      case "BrainCircuit":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4.5 4.5 0 1 0 12 18" />
            <path d="M12 5a3 3 0 1 1 5.997.125" />
            <path d="M12 19a3 3 0 1 0-5.997-.125 4 4 0 0 0-2.526-5.77 4 4 0 0 0 .556-6.588" />
            <path d="M12 19a3 3 0 1 1 5.997.125" />
            <path d="M15 12h-3" />
            <path d="M12 9v6" />
          </svg>
        );
      default:
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          </svg>
        );
    }
  };

  // Handle syllabus download
  const handleDownloadSyllabus = () => {
    // In a real app, this would trigger a download
    console.log("Downloading syllabus...");
    window.open(data.syllabusPath, "_blank");
  };

  // Format price with currency
  const formatPrice = (price: number, currency: string, locale: string) => {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency,
    }).format(price);
  };

  return (
    <div className="mx-auto max-w-7xl mt-2 md:mt-24 overflow-hidden px-2 sm:px-4 lg:px-8">
      {/* Floating Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-red-100 rounded-full opacity-20 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-100 rounded-full opacity-20 blur-3xl" />
      </div>

      {/* Hero Section */}
      <div className="lg:mt-16 mt-4 px-2 sm:px-4 lg:px-0 relative">
        <div className="flex flex-col lg:flex-row items-center gap-8 md:gap-12">
          <div className="w-full md:w-10/12 lg:w-1/2 space-y-4 md:space-y-6">
            <div>
              <Badge className="mb-4 px-4 py-2 bg-gradient-to-r from-red-100 to-red-200 text-red-800 hover:from-red-200 hover:to-red-300 border-0 shadow-xl backdrop-blur-sm font-medium text-sm">
                ✨ {data.badge}
              </Badge>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-800 via-red-600 to-red-800 leading-tight">
              {data.title}
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-gray-600 leading-relaxed max-w-lg">
              {data.subtitle}
            </p>

            <div className="flex flex-wrap gap-2 md:gap-4">
              <Badge
                variant="outline"
                className="px-4 py-2 border-2 border-red-200 text-red-700 bg-red-50 hover:bg-red-100 transition-colors font-medium"
              >
                🎯 {data.mode}
              </Badge>
              <Badge
                variant="outline"
                className="px-4 py-2 border-2 border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors font-medium"
              >
                ⏰ {data.duration}
              </Badge>
            </div>

            <div>
              <Link
                href="https://wa.me/917028511161?text=Hello%20Cyborg,%20I%20am%20looking%20for%20some%20help!%20(Enquiry)"
                target="_blank"
                rel="noopener noreferrer"
              >
                <button className="bg-gradient-to-r from-red-700 to-red-800 hover:from-red-800 hover:to-red-900 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 flex items-center gap-2">
                  <span>🚀 Enroll Now</span>
                </button>
              </Link>
            </div>
          </div>

          <div className="w-full lg:w-1/2 mt-8 lg:mt-0">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-tr from-red-500/10 to-blue-500/10 z-10"></div>
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/10 z-10"></div>

              <Image
                src={data.imagePath}
                alt={data.imageAlt}
                width={600}
                height={400}
                unoptimized
                className="object-cover w-full h-auto max-h-80 sm:max-h-[400px] transition-transform duration-700 hover:scale-110"
              />

              {/* Floating elements */}
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-xl z-20">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Course Overview */}
      <div className="mt-16 sm:mt-20 mx-2 sm:mx-4 lg:mx-8">
        <div className="relative p-4 bg-gradient-to-br from-gray-50 to-white rounded-3xl shadow-xl border border-gray-100">
          <div className="absolute -top-2 -right-2 w-20 h-20 bg-gradient-to-br from-red-400 to-red-600 rounded-full opacity-20 blur-xl" />

          <h2 className="md:text-3xl text-xl font-bold  text-gray-800 mb-6 flex items-center gap-3">
            <span className="md:text-4xl text-xl ">📚</span>
            Course Overview
          </h2>
          <p className="text-gray-700 text-sm md:text-lg leading-relaxed">
            {data.description}
          </p>
        </div>
      </div>

      {/* Key Features */}
      <div className="mt-16 sm:mt-20 mx-2 sm:mx-4 lg:mx-8">
        <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-800 mb-8 sm:mb-12">
          <span className=" mr-3 md:text-3xl text-2xl">🎯</span>
          <span className=" mr-3 md:text-3xl text-2xl">
            {" "}
            What You&apos;ll Master
          </span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {data.keyFeatures.map((feature, index) => (
            <div key={index} className="h-full">
              <Card className="border-0 shadow-xl hover:shadow-xl transition-all duration-300 h-full bg-gradient-to-br from-white to-gray-50 overflow-hidden relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <CardContent className="p-8 relative z-10">
                  <div className="flex items-center mb-6">
                    <div className="p-3 bg-gradient-to-br from-red-100 to-red-200 rounded-xl mr-4 shadow-md">
                      {getIconComponent(feature.iconName)}
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">
                      {feature.title}
                    </h3>
                  </div>
                  <p className="text-gray-600 leading-relaxed text-base">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>

      {/* Learning Journey Timeline */}
      <div className="mt-16 sm:mt-20 mx-2 sm:mx-4 lg:mx-8">
        <div className="p-6 sm:p-10 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-3xl shadow-xl relative overflow-hidden">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `radial-gradient(circle at 25% 25%, #f43f5e 0%, transparent 50%), 
                               radial-gradient(circle at 75% 75%, #3b82f6 0%, transparent 50%)`,
              }}
            />
          </div>

          <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-800 mb-8 sm:mb-12 relative z-10">
            <span className="md:text-5xl text-2xl mr-3">🗺️</span>
            <span className="md:text-5xl text-xl mr-3">
              Your Learning Adventure
            </span>
          </h2>

          <div className="relative flex flex-col gap-6 sm:gap-8 pl-4 sm:pl-4">
            {/* Enhanced vertical line */}
            <div
              className="absolute left-6 top-0 bottom-0 w-1 bg-gradient-to-b from-red-300 via-blue-300 to-purple-300 rounded-full shadow-xl"
              style={{ transformOrigin: "top" }}
            />

            {curriculumData.map((level, index) => (
              <div key={level.id} className="relative flex items-start z-10">
                {/* Enhanced numbered circle */}
                <div className="flex flex-col items-center mr-8">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full bg-gradient-to-br from-red-600 to-red-700 text-white text-lg sm:text-xl font-bold shadow-xl border-4 border-white relative">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-red-400 to-red-600 opacity-0" />
                    <span className="relative z-10">{index + 1}</span>
                  </div>
                </div>

                {/* Enhanced step box */}
                <div className="flex-1 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-4 sm:p-8 border border-white/50 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <h3 className="text-xl sm:text-2xl font-bold text-red-700 mb-2 sm:mb-3 relative z-10">
                    {level.title}
                  </h3>
                  <p className="text-gray-700 text-base sm:text-lg mb-2 sm:mb-3 relative z-10">
                    {level.subtitle[0]}
                  </p>
                  {level.subtitle.length > 1 && (
                    <ul className="space-y-1 sm:space-y-2 relative z-10">
                      {level.subtitle
                        .slice(1)
                        .map((item: string, itemIndex: number) => (
                          <li
                            key={itemIndex}
                            className="text-gray-600 text-sm sm:text-base flex items-start gap-2"
                          >
                            <span className="text-red-500 mt-1">•</span>
                            {item}
                          </li>
                        ))}
                    </ul>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Testimonials */}
      <div className="mt-16 sm:mt-20 mx-2 sm:mx-4 lg:mx-8">
        <Testimonials testimonials={curriculumData} />
      </div>
      {/* NEW: Additional CTA Section for Course Journey */}
      <div className="mt-12 sm:mt-16 mx-2 sm:mx-4 lg:mx-8 p-4 sm:p-8 bg-red-50 rounded-2xl text-center relative overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute -top-4 -right-4 w-24 h-24 bg-red-200 rounded-full opacity-20 blur-2xl" />
        <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-red-100 rounded-full opacity-30 blur-2xl" />

        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-red-800 mb-2 sm:mb-4 relative z-10">
          Ready to Start Your Development Journey?
        </h2>

        <p className="text-gray-700 mb-4 sm:mb-6 max-w-2xl mx-auto relative z-10">
          Join our sscomprehensive course and transform yourself into a skilled
          developer with industry-relevant skills.
        </p>

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 justify-center relative z-10">
          <div>
            <Link
              href="https://wa.me/917028511161?text=Hello%20Cyborg,%20I%20am%20looking%20for%20some%20help!%20(Enquiry)"
              target="_blank"
              rel="noopener noreferrer"
            >
              <button className="bg-red-800 hover:bg-red-700 text-white font-semibold py-2 sm:py-3 px-4 sm:px-6 rounded-xl transition-all duration-300 shadow-md hover:shadow-xl transform hover:-translate-y-0.5">
                Enroll Now
              </button>
            </Link>
          </div>

          <button
            className="bg-white hover:bg-gray-100 text-red-800 font-semibold py-2 sm:py-3 px-4 sm:px-6 rounded-lg border border-red-300 transition-all duration-300 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
            // onClick={handleDownloadSyllabus}
          >
            Download Syllabus
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
}
