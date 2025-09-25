import { Trophy, Target, Zap, Globe, Bot, Medal } from "lucide-react";

export interface CompetitionData {
  id: string;
  title: string;
  description: string;
  category: string;
  skills: string[];
  imageUrl: string;
  level: 'regional' | 'national' | 'international';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  icon: any;
  features: string[];
  outcomes: string[];
  eligibility: string;
  website?: string;
}

export const competitionsData: CompetitionData[] = [
  {
    id: "iro-competition",
    title: "International Robot Olympiad (IRO)",
    description: "A prestigious international robotics competition that challenges students to design, build, and program robots to complete various tasks and missions.",
    category: "International Robotics",
    skills: ["Robot Design", "Programming", "Problem Solving", "Teamwork", "Innovation"],
    imageUrl: "https://images.unsplash.com/photo-1518314916381-77a37c2a49ae?w=400&h=300&fit=crop&q=75",
    level: "international",
    difficulty: "advanced",
    icon: Trophy,
    eligibility: "Students aged 8-19 years",
    website: "https://www.iro.org.tw/",
    features: [
      "Creative robot design challenges",
      "Autonomous robot missions",
      "International collaboration",
      "Multi-level competitions"
    ],
    outcomes: [
      "Advanced robotics skills",
      "International recognition",
      "Engineering problem-solving",
      "Global networking opportunities"
    ]
  },
  {
    id: "wro-competition",
    title: "World Robot Olympiad (WRO)",
    description: "Global robotics competition bringing together young people from around the world to develop their creativity and problem-solving skills through challenging robot competitions.",
    category: "World Robotics",
    skills: ["LEGO Robotics", "Programming", "Strategy", "Engineering", "Teamwork"],
    imageUrl: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=300&fit=crop&q=75",
    level: "international",
    difficulty: "intermediate",
    icon: Globe,
    eligibility: "Students aged 6-25 years",
    website: "https://wro-association.org/",
    features: [
      "Regular category challenges",
      "Open category projects",
      "Future Engineers autonomous driving",
      "National and international finals"
    ],
    outcomes: [
      "STEM education enhancement",
      "Creative thinking development",
      "International competition experience",
      "Technical documentation skills"
    ]
  },
  {
    id: "wsro-competition",
    title: "World School Robot Olympiad (WSRO)",
    description: "Educational robotics competition designed to inspire students in STEM fields through hands-on robot building and programming challenges.",
    category: "School Robotics",
    skills: ["Robot Construction", "Coding", "Mathematics", "Physics", "Collaboration"],
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop&q=75",
    level: "international",
    difficulty: "intermediate",
    icon: Bot,
    eligibility: "School students aged 10-18 years",
    features: [
      "School-based team competitions",
      "Educational curriculum integration",
      "Progressive skill levels",
      "Teacher training programs"
    ],
    outcomes: [
      "STEM skills development",
      "Competitive robotics experience",
      "School recognition programs",
      "Career pathway guidance"
    ]
  },
  {
    id: "first-robotics",
    title: "FIRST Robotics Competition",
    description: "International high school robotics competition that combines the excitement of sport with the rigors of science and technology.",
    category: "FIRST Programs",
    skills: ["Mechanical Design", "Electrical Systems", "Programming", "Strategy", "Business"],
    imageUrl: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=300&fit=crop&q=75",
    level: "international",
    difficulty: "advanced",
    icon: Target,
    eligibility: "High school students (14-18 years)",
    website: "https://www.firstinspires.org/",
    features: [
      "Six-week build season",
      "Professional mentorship",
      "Alliance-based competitions",
      "Scholarship opportunities"
    ],
    outcomes: [
      "Engineering design process mastery",
      "Industry collaboration",
      "Leadership development",
      "College and career preparation"
    ]
  },
  {
    id: "vex-robotics",
    title: "VEX Robotics Competition",
    description: "Student-centered program that promotes STEM learning through competitive robotics, where students work together to design and build robots.",
    category: "VEX Programs",
    skills: ["VEX Programming", "Mechanical Engineering", "Strategy", "Documentation", "Presentation"],
    imageUrl: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=400&h=300&fit=crop&q=75",
    level: "international",
    difficulty: "intermediate",
    icon: Zap,
    eligibility: "Elementary through University students",
    website: "https://www.vexrobotics.com/",
    features: [
      "Game-based challenges",
      "Skills competitions",
      "Programming skills contests",
      "Design awards"
    ],
    outcomes: [
      "Hands-on engineering experience",
      "Programming proficiency",
      "Competition strategy development",
      "Technical communication skills"
    ]
  },
  {
    id: "robocup-junior",
    title: "RoboCup Junior",
    description: "Educational robotics competition for young students to learn about robotics and artificial intelligence through soccer, rescue, and dance challenges.",
    category: "RoboCup Programs",
    skills: ["AI Programming", "Robot Soccer", "Rescue Robotics", "Performance Arts", "Research"],
    imageUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=300&fit=crop&q=75",
    level: "international",
    difficulty: "advanced",
    icon: Medal,
    eligibility: "Students up to 19 years old",
    website: "https://junior.robocup.org/",
    features: [
      "Soccer simulation and robot leagues",
      "Rescue simulation and robot challenges",
      "OnStage performance competitions",
      "Research presentation opportunities"
    ],
    outcomes: [
      "Artificial intelligence understanding",
      "Autonomous robot development",
      "Research methodology skills",
      "International scientific collaboration"
    ]
  }
];

export const competitionCategories = [
  "All Competitions",
  "International Robotics",
  "World Robotics",
  "School Robotics",
  "FIRST Programs",
  "VEX Programs",
  "RoboCup Programs"
];

export const competitionLevelColors = {
  regional: "bg-green-100 text-green-800 border-green-200",
  national: "bg-blue-100 text-blue-800 border-blue-200",
  international: "bg-purple-100 text-purple-800 border-purple-200"
};

export const difficultyColors = {
  beginner: "bg-emerald-100 text-emerald-800 border-emerald-200",
  intermediate: "bg-orange-100 text-orange-800 border-orange-200",
  advanced: "bg-red-100 text-red-800 border-red-200"
};