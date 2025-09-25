import { Award, Users, Trophy, Target, BookOpen, Rocket } from "lucide-react";

export interface FounderData {
  id: string;
  name: string;
  title: string;
  image: string;
  description: string;
  skills: Array<{
    label: string;
    color: 'red' | 'blue' | 'green' | 'purple' | 'yellow' | 'indigo';
  }>;
  achievements: Array<{
    icon: any;
    text: string;
    iconColor: string;
  }>;
  linkedinUrl: string;
  gradientColors: {
    card: string;
    badge: string;
    button: string;
    text: string;
  };
  floatingBadgeIcon: any;
}

export const foundersData: FounderData[] = [
  {
  id: "shikha",
  name: "Shikha Virmani",
  title: "Founder & CEO",
  image: "/assets/certificate.png",
  description: "I’m a passionate advocate for experiential STEM learning with over 12 years of experience in robotics education. I’ve mentored 50+ teams in competitions like WRO, FLL, WSRO, and IRO, coaching students who represented India at WRO 2015 in Qatar and FLL 2016 in Denmark. Before founding Cyborg Robotics Academy, I served as Senior Technical Trainer and Head Coach with the National Organizing Body of WRO India.",
  skills: [
    { label: "EdTech Expert", color: "red" },
    { label: "Robotics Mentor", color: "blue" },
    { label: "12+ Years", color: "green" }
  ],
  achievements: [
    {
      icon: Users,
      text: "Trained 10,000+ students",
      iconColor: "text-red-500"
    },
    {
      icon: Trophy,
      text: "Mentored 50+ competition teams",
      iconColor: "text-red-500"
    },
    {
      icon: Target,
      text: "Represented India at WRO & FLL",
      iconColor: "text-red-500"
    },
    {
      icon: BookOpen,
      text: "Designed scalable STEM curricula",
      iconColor: "text-red-500"
    }
  ],
  linkedinUrl: "https://www.linkedin.com/in/shikha-virmani-31576442/", // replace with real link
  gradientColors: {
    card: "from-white via-gray-50 to-red-50/50",
    badge: "from-red-200 to-red-300",
    button: "from-red-600 to-red-700 hover:from-red-700 hover:to-red-800",
    text: "group-hover:text-red-700"
  },
  floatingBadgeIcon: Award
}
,
{
  id: "lokesh",
  name: "Lokesh Malik",
  title: "Co-Founder & CTO",
  image: "/assets/certificate.png",
  description: "With 12+ years in robotics and STEM education, I am a passionate mentor and strategist driving innovation at Cyborg Robotics Academy. Alongside training 10,000+ students and mentoring 50+ teams at competitions like WRO, FLL, and IRO, I bring diverse professional expertise from aviation, insurance, infrastructure, and entrepreneurship. Holding an MBA in International Business, my career spans leadership roles at VFS Dubai, Air India, and ICICI, as well as delivering critical projects with PWD, MES, and Pune Municipal Corporation. At Cyborg, I merge business strategy with technology, empowering the next generation through hands-on STEM learning and global exposure.",
  skills: [
    { label: "Tech Strategist", color: "blue" },
    { label: "Innovation", color: "purple" },
    { label: "Mentor", color: "green" }
  ],
  achievements: [
    {
      icon: Target,
      text: "Strategic Planning",
      iconColor: "text-blue-500"
    },
    {
      icon: BookOpen,
      text: "Curriculum Design",
      iconColor: "text-blue-500"
    },
    {
      icon: Trophy,
      text: "Led government & infrastructure projects",
      iconColor: "text-blue-500"
    },
    {
      icon: Users,
      text: "Scaled ventures as investor & advisor",
      iconColor: "text-blue-500"
    }
  ],
  linkedinUrl: "https://www.linkedin.com/in/lokesh-malik-670700250/", // replace with his real profile
  gradientColors: {
    card: "from-white via-gray-50 to-blue-50/50",
    badge: "from-blue-200 to-blue-300",
    button: "from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800",
    text: "group-hover:text-blue-700"
  },
  floatingBadgeIcon: Rocket
}

];

// Helper function to get skill colors
export const getSkillColorClasses = (color: string) => {
  const colorMap = {
    red: "bg-red-100 text-red-700",
    blue: "bg-blue-100 text-blue-700",
    green: "bg-green-100 text-green-700",
    purple: "bg-purple-100 text-purple-700",
    yellow: "bg-yellow-100 text-yellow-700",
    indigo: "bg-indigo-100 text-indigo-700"
  };
  return colorMap[color as keyof typeof colorMap] || "bg-gray-100 text-gray-700";
};