// Server Component - no "use client" directive needed
"use client";
import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";

import Image from "next/image";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

// Import Lucide icons
import {
  Code,
  Globe,
  LineChart,
  BrainCircuit,
  Cpu,
  CircuitBoard,
  Zap,
  Lightbulb,
  Palette,
  Layout,
  Rocket,
  Database,
  Smartphone,
  Settings,
  Network,
  Eye,
  MessageSquare,
  Bot,
  Trophy,
  Blocks,
  GraduationCap,
  Printer,
  Cog,
  Brush,
  Gamepad2,
  Wifi,
  ChevronRight,
  Home,
} from "lucide-react";

import Testimonials from "@/components/ui/course-accordion";
import { handleDownloadSyllabus as downloadSyllabus } from "@/lib/utils";

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
  SpikePrimeCurriculum,
  WebDesignCurriculum,
  ElectronicsCurriculumData,
  PeeCeeCurriculumData,
  EarlyElectronicsCurriculumData,
  DroneCurriculumData,
  ThreeDPrintingArduinoCurriculum,
  RoboticsWithQuarkyCurriculum,
  CodingAIWithPictoBloxCurriculum,
} from "../../../../utils/curriculum";
import Header from "@/components/layout/header";
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
    imagePath: "/assets/online-course/python.avif",
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
    duration: "16 CLASSES (x3 LEVELS) (1 HOUR PER CLASS)",
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
    imagePath: "/assets/online-course/webdesigning.png",
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
          "Learn OOP concepts like inheritance, polymorphism and encapsulation",
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
        description: "Master collections, multithreading and Java frameworks",
        iconName: "Settings",
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
    imagePath: "/assets/classroom-course/ev3.png",
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
    imagePath: "/assets/classroom-course/Spike-Prime.png",
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
          "Integrate Science, Technology, Engineering, Arts and Mathematics",
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
    duration: "16 CLASSES (x3 LEVELS) (1 HOUR PER CLASS)",
    syllabusPath: "/assets/pdf/3D PRINTING.pdf",
    syllabusFileName: "3D PRINTING.pdf",
    imagePath: "/assets/classroom-course/3d-printing.png",
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
    duration: "7 CLASSES (x2 LEVELS) (1 HOUR PER CLASS)",
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
        description: "Build fun games, animations and interactive stories",
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
    duration: "16 CLASSES (x2 LEVELS) (1 HOUR PER CLASS)",
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
        description: "Understand resistors, capacitors, transistors and more",
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
  peecee: {
    id: "peecee",
    title: "PeeCee",
    subtitle:
      "Learn the fundamentals of electronics and robotics using the PIC microcontroller",
    badge: " PeeCee Course",
    description:
      "Learn the fundamentals of electronics and robotics using the PIC microcontroller",
    mode: "Offline",
    duration: "12 CLASSES (x2 LEVELS) (1 HOUR PER CLASS)",
    syllabusPath: "/assets/pdf/peecee.pdf",
    syllabusFileName: "peecee.pdf",
    imagePath: "/assets/classroom-course/peecee.webp",
    imageAlt: "peecee",
    price: 12999,
    originalPrice: 17999,
    currency: "INR",
    locale: "en-IN",
    keyFeatures: [
      {
        title: "Microcontroller Programming",
        description: "Learn to program the PIC microcontroller",
        iconName: "Code",
      },
      {
        title: "Robotics Projects",
        description: "Build robotic projects using the PIC microcontroller",
        iconName: "Bot",
      },
      {
        title: "Electronic Circuits",
        description: "Learn to design and build electronic circuits",
        iconName: "CircuitBoard",
      },
      {
        title: "Problem Solving",
        description: "Develop problem-solving and critical thinking skills",
        iconName: "BrainCircuit",
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
        description: "Understand pressure, flow and air dynamics",
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
        description: "Understand gears, belts and power transfer",
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
  "early-electronics": {
    id: "earlyElectronics",
    title: "EARLY ELECTRONICS",
    subtitle:
      "Discover the fundamentals of electronics through hands-on projects and experiments",
    badge: "Foundational Electronics Course",
    description:
      "Explore electronic components, circuits and build exciting projects with our comprehensive early electronics course",
    mode: "Offline",
    duration: "32 CLASSES (x2 LEVELS) (1 HOUR PER CLASS)",
    syllabusPath: "/assets/pdf/EARLY_ELECTRONICS.pdf",
    syllabusFileName: "EARLY_ELECTRONICS.pdf",
    imagePath: "/assets/classroom-course/Early_Electronics.png",
    imageAlt: "Early Electronics Course",
    price: 8999,
    originalPrice: 12999,
    currency: "INR",
    locale: "en-IN",
    keyFeatures: [
      {
        title: "Basic Components",
        description:
          "Learn about resistors, capacitors, LEDs and integrated circuits",
        iconName: "Cpu",
      },
      {
        title: "Circuit Building",
        description: "Construct series, parallel and combinational circuits",
        iconName: "CircuitBoard",
      },
      {
        title: "Transistors & ICs",
        description: "Understand PNP/NPN transistors and integrated circuits",
        iconName: "Zap",
      },
      {
        title: "Hands-on Projects",
        description:
          "Build practical electronics projects including smart devices",
        iconName: "Lightbulb",
      },
    ],
  },
  drone: {
    id: "drone",
    title: "DRONE",
    subtitle:
      "Learn the fundamentals of drone technology and build your own drone",
    badge: "Drone Technology Course",
    description:
      "Learn the fundamentals of drone technology and build your own drone",
    mode: "Offline",
    duration: "12 CLASSES (x1 LEVEL) (1 HOUR PER CLASS)",
    syllabusPath: "/assets/pdf/DRONE.pdf",
    syllabusFileName: "DRONE.pdf",
    imagePath: "/assets/classroom-course/Drone.png",
    imageAlt: "Drone Course",
    price: 9999,
    originalPrice: 14999,
    currency: "INR",
    locale: "en-IN",
    keyFeatures: [
      {
        title: "Drone Technology",
        description: "Learn the fundamentals of drone technology",
        iconName: "Rocket",
      },
      {
        title: "Drone Assembly",
        description: "Build your own drone from scratch",
        iconName: "Settings",
      },
      {
        title: "Flight Control",
        description: "Learn to control and operate your drone",
        iconName: "Bot",
      },
    ],
  },
  "3d-printing-arduino": {
    id: "printing3dArduino",
    title: "3D PRINTING + ARDUINO",
    subtitle:
      "Combine 3D printing and Arduino to create innovative electronic projects",
    badge: "Electronics & Digital Manufacturing Course",
    description:
      "Combine 3D printing and Arduino to create innovative electronic projects",
    mode: "Offline",
    duration: "16 CLASSES (x4 LEVELS) (1 HOUR PER CLASS)",
    syllabusPath: "/assets/pdf/3D-PRINTING-ARDUINO.pdf",
    syllabusFileName: "3D PRINTING ARDUINO.pdf",
    imagePath: "/assets/classroom-course/3d-printing-arduino.png",
    imageAlt: "3D Printing + Arduino Course",
    price: 12999,
    originalPrice: 17999,
    currency: "INR",
    locale: "en-IN",
    keyFeatures: [
      {
        title: "3D Design & Printing",
        description:
          "Learn to design and print custom 3D objects using CAD software",
        iconName: "Printer",
      },
      {
        title: "Arduino Programming",
        description:
          "Master Arduino microcontroller programming and electronics",
        iconName: "Cpu",
      },
      {
        title: "Integrated Projects",
        description:
          "Build complete projects combining 3D printed parts with electronics",
        iconName: "Zap",
      },
      {
        title: "Innovation & Creativity",
        description:
          "Develop creative solutions using both technologies together",
        iconName: "Lightbulb",
      },
    ],
  },
  "robotics-with-quarky": {
    id: "roboticsWithQuarky",
    title: "ROBOTICS WITH QUARKY",
    subtitle: "Hands-on robotics, AI, and coding using Quarky and PictoBlox",
    badge: "Robotics & AI Foundation Program",
    description:
      "An experiential robotics program where students learn coding, sensors, motion control, and AI concepts by building real-world robots using Quarky and PictoBlox.",
    mode: "Offline",
    duration: "28 CLASSES (x2 LEVELS) (1 HOUR PER CLASS)",
    syllabusPath: "/assets/pdf/ROBOTICS_WITH_QUARKY.pdf",
    syllabusFileName: "ROBOTICS_WITH_QUARKY.pdf",
    imagePath: "/assets/classroom-course/Quarky.png",
    imageAlt: "Robotics with Quarky Course",
    price: 12999,
    originalPrice: 17999,
    currency: "INR",
    locale: "en-IN",
    keyFeatures: [
      {
        title: "Block-Based Coding",
        description:
          "Learn programming fundamentals using PictoBlox with Quarky integration",
        iconName: "Code",
      },
      {
        title: "Sensors & Automation",
        description:
          "Work with ultrasonic, IR, touch, and environmental sensors",
        iconName: "Radar",
      },
      {
        title: "Robotics & Motion Control",
        description:
          "Understand motors, servos, steering logic, and autonomous movement",
        iconName: "Bot",
      },
      {
        title: "AI & Capstone Projects",
        description:
          "Build AI-powered robots including object tracking and self-driving systems",
        iconName: "Brain",
      },
    ],
  },
  "coding-ai-pictoblox": {
    id: "codingAiPictoblox",
    title: "Coding with AI and Pictoblox",
    subtitle: "Learn to code using AI and Pictoblox",
    badge: "Coding with AI Course",
    description: "Learn to code using AI and Pictoblox",
    mode: "Online & Offline",
    duration: "16 CLASSES (x2 LEVELS) (1 HOUR PER CLASS)",
    syllabusPath: "/assets/pdf/AI-with-Pictoblox.pdf",
    syllabusFileName: "AI-with-Pictoblox.pdf",
    imagePath: "/assets/classroom-course/picto-ai.png",
    imageAlt: "Coding with AI Course",
    price: 16999,
    originalPrice: 23999,
    currency: "INR",
    locale: "en-IN",
    keyFeatures: [
      {
        title: "AI Integration",
        description: "Learn to integrate AI into your code",
        iconName: "Zap",
      },
      {
        title: "Pictoblox Coding",
        description: "Learn to code using Pictoblox",
        iconName: "Cpu",
      },
      {
        title: "Automation",
        description: "Create automated systems using AI and Pictoblox",
        iconName: "Bot",
      },
      {
        title: "Problem Solving",
        description: "Develop problem-solving skills through coding",
        iconName: "Lightbulb",
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
        // Transform ArduinoCurriculum to match CurriculumLevel[] structure
        return ArduinoCurriculum.levels.map((level: any) => ({
          id: level.id,
          title: level.title,
          subtitle: [
            ...level.modules.map(
              (module: any) => `${module.title}: ${module.topics.join(", ")}`
            ),
            ...level.megaProjects.map(
              (project: string) => `Mega Project: ${project}`
            ),
          ],
        }));
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
      case "coding-ai-pictoblox":
        // Transform CodingAIWithPictoBloxCurriculum to match CurriculumLevel[] structure
        return CodingAIWithPictoBloxCurriculum.levels.map((level: any) => ({
          id: level.id,
          title: level.title,
          subtitle: [
            ...level.modules.map(
              (module: any) => `${module.title}: ${module.topics.join(", ")}`
            ),
            ...level.megaProjects.map(
              (project: string) => `Mega Project: ${project}`
            ),
          ],
        }));
      case "spike-prime":
        return SpikePrimeCurriculum;
      case "3d-printing":
        // Transform ThreeDPrintingCurriculum to match CurriculumLevel[] structure
        return [
          {
            id: "level1",
            title: ThreeDPrintingCurriculum.level1.title,
            subtitle: ThreeDPrintingCurriculum.level1.modules.map(
              (module) => `${module.title}: ${module.subtitle.join(", ")}`
            ),
          },
          {
            id: "level2",
            title: ThreeDPrintingCurriculum.level2.title,
            subtitle: ThreeDPrintingCurriculum.level2.modules.map(
              (module) => `${module.title}: ${module.subtitle.join(", ")}`
            ),
          },
          {
            id: "level3",
            title: ThreeDPrintingCurriculum.level3.title,
            subtitle: ThreeDPrintingCurriculum.level3.modules.map(
              (module) => `${module.title}: ${module.subtitle.join(", ")}`
            ),
          },
        ];
      case "bambino-coding":
        return BambinoCodingCurriculum;
      case "electronics":
        return ElectronicsCurriculumData;
      case "early-electronics":
        return EarlyElectronicsCurriculumData;
      case "animation-coding":
        return AnimationAndCodingCurriculum;
      case "app-designing":
        return AppDevelopmentData;
      case "early-simple-machines":
        return EarlySimplemachineCurriculum;
      case "iot":
        return IotCurriculum;

      case "simple-powered-machines":
        return SimplePoweredMachines;
      case "app-lab":
        return AppLabCurriculum;
      case "peecee":
        // Transform PeeCeeCurriculumData to match CurriculumLevel[] structure
        return PeeCeeCurriculumData.map((level: any) => ({
          id: level.id.toString(),
          title: level.title,
          subtitle: level.subtitle,
        }));
      case "drone":
        // Transform DroneCurriculumData to match CurriculumLevel[] structure
        return DroneCurriculumData.map((level: any) => ({
          id: level.id.toString(),
          title: level.title,
          subtitle: level.subtitle,
        }));
      case "robotics-with-quarky":
        return RoboticsWithQuarkyCurriculum;
      case "3d-printing-arduino":
        // Transform ThreeDPrintingArduinoCurriculum to match CurriculumLevel[] structure
        return ThreeDPrintingArduinoCurriculum.levels.map((level: any) => ({
          id: level.id,
          title: level.title,
          subtitle: [
            ...level.modules.map(
              (module: any) => `${module.title}: ${module.topics.join(", ")}`
            ),
            ...level.megaProjects.map(
              (project: string) => `Mega Project: ${project}`
            ),
          ],
        }));
      default:
        // Return default curriculum data if no specific curriculum is found
        return [
          {
            id: "level1",
            title: "Foundation",
            subtitle: [
              "Introduction to programming concepts",
              "Variables, data types and operators",
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

  // Icon component mapping - replaced SVG implementation with Lucide icons
  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case "Code":
        return <Code className="w-6 h-6" />;
      case "Globe":
        return <Globe className="w-6 h-6" />;
      case "LineChart":
        return <LineChart className="w-6 h-6" />;
      case "BrainCircuit":
        return <BrainCircuit className="w-6 h-6" />;
      case "Cpu":
        return <Cpu className="w-6 h-6" />;
      case "CircuitBoard":
        return <CircuitBoard className="w-6 h-6" />;
      case "Zap":
        return <Zap className="w-6 h-6" />;
      case "Lightbulb":
        return <Lightbulb className="w-6 h-6" />;
      case "Palette":
        return <Palette className="w-6 h-6" />;
      case "Layout":
        return <Layout className="w-6 h-6" />;
      case "Rocket":
        return <Rocket className="w-6 h-6" />;
      case "Database":
        return <Database className="w-6 h-6" />;
      case "Smartphone":
        return <Smartphone className="w-6 h-6" />;
      case "Settings":
        return <Settings className="w-6 h-6" />;
      case "Network":
        return <Network className="w-6 h-6" />;
      case "Eye":
        return <Eye className="w-6 h-6" />;
      case "MessageSquare":
        return <MessageSquare className="w-6 h-6" />;
      case "Bot":
        return <Bot className="w-6 h-6" />;
      case "Trophy":
        return <Trophy className="w-6 h-6" />;
      case "Blocks":
        return <Blocks className="w-6 h-6" />;
      case "GraduationCap":
        return <GraduationCap className="w-6 h-6" />;
      case "Printer":
        return <Printer className="w-6 h-6" />;
      case "Cog":
        return <Cog className="w-6 h-6" />;
      case "Brush":
        return <Brush className="w-6 h-6" />;
      case "Gamepad2":
        return <Gamepad2 className="w-6 h-6" />;
      case "Wifi":
        return <Wifi className="w-6 h-6" />;
      default:
        return <Code className="w-6 h-6" />;
    }
  };

  // Handle syllabus download
  const handleDownloadSyllabus = () => {
    downloadSyllabus(data.syllabusPath, data.syllabusFileName);
  };

  // Format price with currency
  const formatPrice = (price: number, currency: string, locale: string) => {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency,
    }).format(price);
  };

  return (
    <div className="mx-auto max-w-7xl mt-2 md:mt-5 overflow-hidden px-2 sm:px-4 lg:px-8">
      {/* Breadcrumb */}
      <Header />
      <nav className="flex mt-13" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse">
          <li className="inline-flex items-center">
            <Link
              href="/"
              className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-red-600"
            >
              <Home className="w-4 h-4 mr-2" />
              Home
            </Link>
          </li>
          <li>
            <div className="flex items-center">
              <ChevronRight className="w-4 h-4 text-gray-400 mx-1" />
              <Link
                href="/all-courses"
                className="ml-1 text-sm font-medium text-gray-700 hover:text-red-600 md:ml-2"
              >
                All Courses
              </Link>
            </div>
          </li>
          <li aria-current="page">
            <div className="flex items-center">
              <ChevronRight className="w-4 h-4 text-gray-400 mx-1" />
              <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">
                {data.title}
              </span>
            </div>
          </li>
        </ol>
      </nav>

      {/* Hero Section */}
      <div className="lg:mt-8 mt-4 px-2 sm:px-4 lg:px-0 relative">
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
            <div className="relative rounded-3xl overflow-hidden shadow-xl">
              <Image
                src={data.imagePath}
                alt={data.imageAlt}
                width={600}
                height={400}
                unoptimized
                className="object-cover w-full h-auto max-h-80 sm:max-h-[400px] "
              />
            </div>
          </div>
        </div>
      </div>

      {/* Course Overview */}
      <div className="mt-16 sm:mt-20 mx-2 sm:mx-4 lg:mx-8">
        <div className="relative p-4 bg-gradient-to-br from-gray-50 to-white rounded-3xl shadow-xl border border-gray-100">
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
            onClick={handleDownloadSyllabus}
          >
            Download Syllabus
          </button>
        </div>
      </div>
    </div>
  );
}
