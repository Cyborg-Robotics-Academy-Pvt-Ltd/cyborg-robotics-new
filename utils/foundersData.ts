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
  description: "Founder & CEO with 12+ years in robotics education. B.Tech in Electronics and Communication. Coached students to international success at WRO & FLL. Advocates for hands-on STEM learning that builds technical skills and critical thinking.",
  skills: [
    { label: "EdTech Expert", color: "red" },
    { label: "12+ Years", color: "green" },
    

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
  title: "Director of Operations",
  image: "/assets/Founders/lokesh1.png",
  description: "Director of Operations with diverse industry experience. MBA in International Business. Formerly with Air India and VFS Global. Led specialized projects and managed government contracts. Brings strategic vision and operational excellence to STEM education.",
  skills: [
    { label: "Tech Strategist", color: "blue" },
    { label: "Strategic Thinking", color: "yellow" },
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