// This file contains random course data used by CoursePage

export interface CourseFeature {
  title: string;
  description: string;
  iconName: string;
}

export interface CourseData {
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
  locale: string;
  price?: number;
  originalPrice?: number;
  keyFeatures: CourseFeature[];
  courseOverview: string;
}

export const courseData: Record<string, CourseData> = {
  "web-development": {
    id: "web-development",
    title: "Full Stack Web Development",
    subtitle: "Master front-end and back-end web technologies",
    badge: "Popular Course",
    description:
      "A comprehensive course covering HTML, CSS, JavaScript, React, Node.js, and databases.",
    mode: "Online / Offline",
    duration: "6 Months",
    syllabusPath: "/syllabus/web-development.pdf",
    syllabusFileName: "Web_Development_Syllabus.pdf",
    imagePath: "/images/courses/web-dev.jpg",
    imageAlt: "Web development course preview",
    locale: "en-IN",
    price: 29999,
    originalPrice: 39999,
    keyFeatures: [
      {
        title: "Hands-on Projects",
        description: "Build real-world full stack applications.",
        iconName: "Hammer",
      },
      {
        title: "Expert Mentors",
        description: "Learn directly from experienced industry professionals.",
        iconName: "UserCheck",
      },
      {
        title: "Career Guidance",
        description: "Get placement support and resume assistance.",
        iconName: "Briefcase",
      },
      {
        title: "Certificate of Completion",
        description: "Earn a recognized certificate after course completion.",
        iconName: "Award",
      },
    ],
    courseOverview:
      "This Full Stack Web Development course helps you become a professional developer capable of building complete web applications. You'll gain mastery over front-end and back-end technologies, databases, and deployment workflows.",
  },

  "ai-robotics": {
    id: "ai-robotics",
    title: "AI & Robotics Engineering",
    subtitle: "Learn to design intelligent robotic systems",
    badge: "New Launch",
    description:
      "Explore the fusion of Artificial Intelligence and Robotics to create autonomous systems.",
    mode: "Offline",
    duration: "9 Months",
    syllabusPath: "/syllabus/ai-robotics.pdf",
    syllabusFileName: "AI_Robotics_Syllabus.pdf",
    imagePath: "/images/courses/ai-robotics.jpg",
    imageAlt: "AI and robotics course",
    locale: "en-IN",
    price: 44999,
    originalPrice: 54999,
    keyFeatures: [
      {
        title: "AI Algorithms",
        description: "Understand the principles behind intelligent behavior.",
        iconName: "Cpu",
      },
      {
        title: "Robotics Hardware",
        description: "Work hands-on with sensors, motors, and microcontrollers.",
        iconName: "Cpu",
      },
      {
        title: "Simulation Practice",
        description: "Design and test your robots in virtual environments.",
        iconName: "Monitor",
      },
      {
        title: "Capstone Project",
        description: "Develop a real autonomous robot as your final project.",
        iconName: "Rocket",
      },
    ],
    courseOverview:
      "The AI & Robotics course offers a deep dive into the design and development of intelligent robotic systems. You'll explore computer vision, path planning, sensor integration, and AI decision-making systems to prepare for next-gen automation careers.",
  },
};
