import { Award, Users, Trophy, Target, BookOpen, Rocket, Crown, Lightbulb, UserCog } from "lucide-react";

export interface FounderData {
  id: string;
  name: string;
  title: string;
  image: string;
  description: string;
  skills?: Array<{
    label: string;
    color: 'red' | 'blue' | 'green' | 'purple' | 'yellow' | 'indigo';
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
  image: "/assets/founders/shikha1.png",
  description: "Founder & CEO with 12+ years in robotics education. B.Tech in Electronics and Communication. Coached students to international success at WRO & FLL. Advocates for hands-on STEM learning that builds technical skills and critical thinking. Formerly with Air India and VFS Global.",
  
  linkedinUrl: "https://www.linkedin.com/in/shikha-virmani-31576442/", // replace with real link
  gradientColors: {
    card: "from-white via-gray-50 to-red-50/50",
    badge: "from-red-200 to-red-300",
    button: "from-red-600 to-red-700 hover:from-red-700 hover:to-red-800",
    text: "group-hover:text-red-700"
  },
  floatingBadgeIcon: Crown
}
,
{
  id: "lokesh",
  name: "Lokesh Malik",
  title: "Director of Operations",
  image: "/assets/Founders/lokesh.png",
  description: "Director of Operations with diverse industry experience. MBA in International Business. Formerly with Air India and VFS Global. Led specialized projects and managed government contracts. Brings strategic vision and operational excellence to STEM education. Passionate about innovation and impact.",
  
  
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

// Helper function to get skill colors with brand palette
export const getSkillColorClasses = (color: string) => {
  // Using the brand palette:
  // #b92423 (Primary Red) - for red
  // #ab2623 / #9d2723 (Mid Reds) - for variations
  // #7f2823 (Deep Red) - for darker shades
  // #252e43 (Dark Blue-Grey) - for text/background
  const colorMap = {
    red: "bg-gradient-to-r from-[#b92423] to-[#9d2723] text-white",
    blue: "bg-gradient-to-r from-[#252e43] to-[#9d2723] text-white",
    green: "bg-gradient-to-r from-[#252e43] to-[#7f2823] text-white",
    purple: "bg-gradient-to-r from-[#252e43] to-[#b92423] text-white",
    yellow: "bg-gradient-to-r from-[#9d2723] to-[#7f2823] text-white",
    indigo: "bg-gradient-to-r from-[#252e43] to-[#ab2623] text-white"
  };
  return colorMap[color as keyof typeof colorMap] || "bg-gray-100 text-gray-700";
};