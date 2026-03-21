import { CourseData } from "./courseData";

// Enhanced course data with age ranges and categories
export interface EnhancedCourseData extends CourseData {
  ageRange: string;
  category: string;
}

// Define course categories
export const COURSE_CATEGORIES = [
  "Robotics",
  "Programming",
  "Electronics",
  "3D Printing",
  "Drones",
  "Other",
] as const;

export type CourseCategory = (typeof COURSE_CATEGORIES)[number];

// Enhanced course data with age ranges and categories
export const enhancedCourseData: Record<string, EnhancedCourseData> = {
  "python-language": {
    id: "python",
    title: "Python",
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
    courseOverview:
      "Python is a powerful programming language that lets you work quickly and integrate systems more effectively. As a general-purpose, high-level language, Python allows you to focus on core functionality of applications by taking care of common programming tasks. Python's simple syntax emphasizes readability, reducing the cost of program maintenance. Its comprehensive standard library and interpreter are freely available for all major platforms, making it perfect for developing desktop GUI applications, websites, web applications, data analysis tools and even artificial intelligence systems. Our comprehensive course covers Python from basics to advanced concepts across six progressive levels.",
    ageRange: "11-16",
    category: "Programming",
  },
  kubo: {
    id: "kubo",
    title: "KUBO Robotics",
    subtitle:
      "Learn coding fundamentals through hands-on robot navigation using TagTiles",
    badge: "Robotics Course",
    description:
      "Develop logical thinking and programming skills using KUBO's hands-on, screen-free coding system.",
    mode: "Offline",
    duration: "12 DAYS (x2 LEVELS) (1 HOUR PER SESSION)",
    syllabusPath: "/assets/pdf/KUBO.pdf",
    syllabusFileName: "KUBO.pdf",
    imagePath: "/assets/classroom-course/kubo.png",
    imageAlt: "KUBO Robotics Course",
    price: 7499,
    originalPrice: 9999,
    currency: "INR",
    locale: "en-IN",
    keyFeatures: [
      {
        title: "Screen-Free Coding",
        description:
          "Learn programming concepts using physical TagTiles without screens",
        iconName: "Code",
      },
      {
        title: "Functions & Subroutines",
        description:
          "Understand reusable code blocks and modular programming logic",
        iconName: "GitBranch",
      },
      {
        title: "Loops & Recursion",
        description:
          "Optimize routes using loops and advanced repetition logic",
        iconName: "Repeat",
      },
      {
        title: "IRO Challenges",
        description:
          "Apply coding concepts in real-world mission-based challenges",
        iconName: "Target",
      },
    ],
    courseOverview:
      "KUBO Robotics is a hands-on educational robotics program designed to introduce students to foundational programming concepts through physical interaction. Students learn sequencing, functions, subroutines, loops, and problem-solving using TagTiles and activity maps. The course progresses from basic route planning to advanced logical structuring and IRO challenge missions.",
    ageRange: "4-6",
    category: "Lego-Robotics",
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
    courseOverview:
      "Arduino is an open-source electronics platform based on easy-to-use hardware and software. It's intended for anyone making interactive projects. Arduino boards are able to read inputs - light on a sensor, a finger on a button, or a Twitter message - and turn it into an output - activating a motor, turning on an LED, publishing something online. You can tell your board what to do by sending a set of instructions to the microcontroller on the board. Our comprehensive Arduino course covers everything from basic electronics concepts to advanced IoT projects.",
    ageRange: "11-16",
    category: "Electronics",
  },
  "web-designing": {
    id: "web-designing",
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
    courseOverview:
      "Web design encompasses many different skills and disciplines in the production and maintenance of websites. The different areas of web design include web graphic design; user interface design; authoring, including standardized code and proprietary software; user experience design; and search engine optimization. Our comprehensive web designing course covers HTML, CSS, responsive design and modern web development practices to create stunning, functional websites.",
    ageRange: "11-16",
    category: "Programming",
  },
  java: {
    id: "java",
    title: "Java",
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
    courseOverview:
      "Java is a high-level, class-based, object-oriented programming language that is designed to have as few implementation dependencies as possible. It is a general-purpose programming language intended to let programmers write once, run anywhere, meaning that compiled Java code can run on all platforms that support Java without the need to recompile. Our comprehensive Java course covers everything from basic syntax to advanced enterprise development concepts.",
    ageRange: "11-16",
    category: "Programming",
  },

  // "machine-learning": {
  //   id: "machineLearning",
  //   title: "Machine Learning",
  //   subtitle: "Master the fundamentals of machine learning and build intelligent applications",
  //   badge: "AI & Data Science Course",
  //   description: "Master the fundamentals of machine learning and build intelligent applications",
  //   mode: "Online & Offline",
  //   duration: "16 CLASSES (x4 LEVELS) (1 HOUR PER CLASS)",
  //   syllabusPath: "/assets/pdf/MACHINE LEARNING.pdf",
  //   syllabusFileName: "MACHINE LEARNING.pdf",
  //   imagePath: "/assets/online-course/machine-learning.webp",
  //   imageAlt: "Machine Learning Course",
  //   price: 18999,
  //   originalPrice: 25999,
  //   currency: "INR",
  //   locale: "en-IN",
  //   keyFeatures: [
  //     {
  //       title: "ML Fundamentals",
  //       description: "Learn core machine learning concepts and algorithms",
  //       iconName: "BrainCircuit",
  //     },
  //     {
  //       title: "Data Processing",
  //       description: "Master data preprocessing and feature engineering techniques",
  //       iconName: "Database",
  //     },
  //     {
  //       title: "Model Training",
  //       description: "Train and evaluate machine learning models effectively",
  //       iconName: "LineChart",
  //     },
  //     {
  //       title: "Real-world Applications",
  //       description: "Build practical ML applications for various domains",
  //       iconName: "Rocket",
  //     },
  //   ],
  //   courseOverview: "Machine Learning is a subset of artificial intelligence that enables computers to learn and make decisions from data without being explicitly programmed. Our comprehensive machine learning course covers supervised and unsupervised learning, neural networks, deep learning and practical applications in various industries. Students will learn to build and deploy machine learning models using popular frameworks like TensorFlow and scikit-learn.",
  //   ageRange: "14+",
  //   category: "Programming"
  // },
  // "artificial-intelligence": {
  //   id: "artificialIntelligence",
  //   title: "Artificial Intelligence",
  //   subtitle: "Explore the cutting-edge world of AI and build intelligent systems",
  //   badge: "Advanced AI Course",
  //   description: "Explore the cutting-edge world of AI and build intelligent systems",
  //   mode: "Online & Offline",
  //   duration: "16 CLASSES (x4 LEVELS) (1 HOUR PER CLASS)",
  //   syllabusPath: "/assets/pdf/ARTIFICIAL INTELLIGENCE.pdf",
  //   syllabusFileName: "ARTIFICIAL INTELLIGENCE.pdf",
  //   imagePath: "/assets/online-course/aigif.webp",
  //   imageAlt: "Artificial Intelligence Course",
  //   price: 19999,
  //   originalPrice: 28999,
  //   currency: "INR",
  //   locale: "en-IN",
  //   keyFeatures: [
  //     {
  //       title: "AI Fundamentals",
  //       description: "Understand core AI concepts and problem-solving approaches",
  //       iconName: "BrainCircuit",
  //     },
  //     {
  //       title: "Neural Networks",
  //       description: "Build and train deep neural networks for complex tasks",
  //       iconName: "Network",
  //     },
  //     {
  //       title: "Computer Vision",
  //       description: "Implement AI systems that can see and understand images",
  //       iconName: "Eye",
  //     },
  //     {
  //       title: "Natural Language Processing",
  //       description: "Create AI systems that understand and generate human language",
  //       iconName: "MessageSquare",
  //     },
  //   ],
  //   courseOverview: "Artificial Intelligence is the simulation of human intelligence in machines that are programmed to think and learn like humans. Our comprehensive AI course covers machine learning, deep learning, computer vision, natural language processing and robotics. Students will learn to build intelligent systems that can perform tasks that typically require human intelligence.",
  //   ageRange: "11-16",
  //   category: "Programming"
  // },
  "robotics-ev3": {
    id: "roboticsEv3",
    title: "Robotics EV3",
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
    courseOverview:
      "LEGO Mindstorms EV3 is a robotics kit that allows students to build and program robots. Our comprehensive robotics course combines mechanical engineering, programming and problem-solving skills. Students will learn to design, build and program robots that can navigate mazes, pick up objects and compete in various challenges.",
    ageRange: "11-16",
    category: "Lego-Robotics",
  },
  "robotics-with-quarky": {
    id: "roboticsWithQuarky",
    title: "Robotics with Quarky",
    subtitle: "Hands-on robotics, AI, and coding using Quarky and PictoBlox",
    badge: "Robotics & AI Foundation Program",
    description:
      "An experiential robotics program where students learn coding, sensors, motion control, and AI concepts by building real-world robots using Quarky and PictoBlox.",
    mode: "Offline",
    duration: "14 CLASSES (x2 LEVELS) (1 HOUR PER CLASS)",
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

    courseOverview:
      "Robotics with Quarky is a comprehensive hands-on learning program that introduces students to robotics, automation, and artificial intelligence using the Quarky robot and PictoBlox platform. The course blends coding, electronics, sensors, and mechanical logic to help learners move from screen-based programming to real-world robotic applications. Structured across two progressive levels, students begin with foundational robotics concepts such as sensors, motion, and control logic, and advance to AI-based systems like object tracking, self-driving robots, and automated pick-and-place mechanisms. Each session emphasizes concept clarity, applied learning, and problem-solving, culminating in capstone projects that demonstrate complete robotics workflows.",

    ageRange: "6-9",
    category: "Lego-Robotics",
  },
  "spike-essential": {
    id: "spikeEssential",
    title: "SPIKE ESSENTIAL",
    subtitle: "Learn robotics and coding with LEGO Education SPIKE Essential",
    badge: "Educational Robotics Course",
    description:
      "Learn robotics and coding with LEGO Education SPIKE Essential",
    mode: "Offline",
    duration: "16 CLASSES (x1 LEVEL) (1 HOUR PER CLASS)",
    syllabusPath: "/assets/pdf/Spike Essential.pdf",
    syllabusFileName: "SPIKE ESSENTIAL.pdf",
    imagePath: "/assets/classroom-course/spike-essential.png",
    imageAlt: "SPIKE Essential Course",
    price: 7999,
    originalPrice: 12999,
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
    courseOverview:
      "LEGO Education SPIKE Essential is a STEAM learning solution that combines colorful LEGO building elements, easy-to-use hardware and an intuitive drag-and-drop coding language based on Scratch. Our comprehensive SPIKE Essential course helps students develop critical thinking and problem-solving skills through engaging robotics projects.",
    ageRange: "6-9",
    category: "Lego-Robotics",
  },
  "spike-prime": {
    id: "spikePrime",
    title: "Spike Prime",
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
    courseOverview:
      "LEGO Education SPIKE Prime is a STEAM learning solution that combines colorful LEGO building elements, easy-to-use hardware and an intuitive drag-and-drop coding language based on Scratch. Our comprehensive SPIKE Prime course helps students develop critical thinking and problem-solving skills through engaging robotics projects.",
    ageRange: "11-16",
    category: "Lego-Robotics",
  },

  "spike-prime-python": {
    id: "spikePrimePython",
    title: "SPIKE PRIME + Python",
    subtitle:
      "Combine LEGO SPIKE Prime robotics with Python programming for advanced automation",
    badge: "Advanced Robotics Course",
    description:
      "Combine LEGO SPIKE Prime robotics with Python programming for advanced automation",
    mode: "Offline",
    duration: "16 CLASSES (x3 LEVELS) (1 HOUR PER CLASS)",
    syllabusPath: "/assets/pdf/Spike Prime Python.pdf",
    syllabusFileName: "SPIKE PRIME + Python.pdf",
    imagePath: "/assets/classroom-course/Spike-Prime-Python.png",
    imageAlt: "SPIKE Prime + Python Course",
    price: 12999,
    originalPrice: 17999,
    currency: "INR",
    locale: "en-IN",
    keyFeatures: [
      {
        title: "Python Programming",
        description:
          "Learn Python programming concepts for robotics automation",
        iconName: "Code",
      },
      {
        title: "Robotics Projects",
        description: "Build advanced robotics projects using Python",
        iconName: "Bot",
      },
      {
        title: "Sensor Integration",
        description: "Integrate sensors for advanced robotics applications",
        iconName: "Radar",
      },
      {
        title: "Automation Solutions",
        description:
          "Develop automation solutions using Python and SPIKE Prime",
        iconName: "Rocket",
      },
    ],
    courseOverview:
      "LEGO Education SPIKE Prime is a STEAM learning solution that combines colorful LEGO building elements, easy-to-use hardware and an intuitive drag-and-drop coding language based on Scratch. Our comprehensive SPIKE Prime course helps students develop critical thinking and problem-solving skills through engaging robotics projects.",
    ageRange: "11-16",
    category: "Lego-Robotics",
  },
  "3d-printing": {
    id: "3dPrinting",
    title: "3D Printing",
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
    courseOverview:
      "3D printing is a manufacturing process that creates three-dimensional objects by depositing materials layer by layer. Our comprehensive 3D printing course covers 3D design, slicing software, printing technology and post-processing techniques. Students will learn to design and print their own 3D objects using modern 3D printing technology.",
    ageRange: "8-12",
    category: "3D Printing",
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
    duration: "14 CLASSES (x1 LEVELS) (1 HOUR PER CLASS)",
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
    courseOverview:
      "Bambino Coding is designed specifically for young learners to introduce them to the exciting world of programming. Using age-appropriate tools and visual programming languages, children learn to create games, animations and interactive stories while developing essential computational thinking skills. Our course makes coding fun and accessible, building a strong foundation for future learning.",
    ageRange: "4-6",
    category: "Programming",
  },

  "animation-coding": {
    id: "animationCoding",
    title: "Animation & Coding",
    subtitle:
      "Create stunning animations and visual effects through programming",
    badge: "Creative Programming Course",
    description:
      "Create stunning animations and visual effects through programming",
    mode: "Online & Offline",
    duration: "14 CLASSES (x2 LEVELS) (1 HOUR PER CLASS)",
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
    courseOverview:
      "Animation Coding combines the power of programming with the creativity of visual arts. Students learn to create stunning animations, interactive graphics and visual effects using code. This course teaches both the technical skills of animation programming and the artistic principles of visual design, allowing students to bring their creative ideas to life through code.",
    ageRange: "9-13",
    category: "Programming",
  },
  "app-designing": {
    id: "appDesigning",
    title: "App Designing",
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
    courseOverview:
      "App Designing focuses on creating user-friendly and visually appealing mobile applications. Students learn modern UI/UX design principles, user research, wireframing, prototyping and using industry-standard design tools. This course prepares students to design mobile apps that are both beautiful and functional, with a focus on user experience and accessibility.",
    ageRange: "11-16",
    category: "Programming",
  },
  "early-simple-machines": {
    id: "earlySimpleMachines",
    title: "Early Simple Machines",
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
    courseOverview:
      "Early Simple Machines introduces students to fundamental mechanical principles through hands-on building and experimentation. Students learn about levers, pulleys, gears and other simple machines while constructing working models. This course builds a strong foundation in mechanical engineering concepts and develops problem-solving skills through practical projects.",
    ageRange: "4-6",
    category: "Lego-Robotics",
  },

  // "3d-printing-arduino": {
  //   id: "3dPrintingArduino",
  //   title: "3D Printing + Arduino Course",
  //   subtitle: "Combine 3D printing and Arduino to create innovative electronic projects",
  //   badge: "Electronics & Digital Manufacturing Course",
  //   description: "Combine 3D printing and Arduino to create innovative electronic projects",
  //   mode: "Offline",
  //   duration: "16 CLASSES (x3 LEVELS) (1 HOUR PER CLASS)",
  //   syllabusPath: "/assets/pdf/3D PRINTING ARDUINO.pdf",
  //   syllabusFileName: "3D PRINTING ARDUINO.pdf",
  //   imagePath: "/assets/classroom-course/3d-printing-arduino.png",
  //   imageAlt: "3D Printing + Arduino Course",
  //   price: 12999,
  //   originalPrice: 17999,
  //   currency: "INR",
  //   locale: "en-IN",
  //   keyFeatures: [
  //     {
  //       title: "3D Design & Printing",
  //       description: "Learn to design and print custom 3D objects using CAD software",
  //       iconName: "Printer",
  //     },
  //     {
  //       title: "Arduino Programming",
  //       description: "Master Arduino microcontroller programming and electronics",
  //       iconName: "Cpu",
  //     },
  //     {
  //       title: "Integrated Projects",
  //       description: "Build complete projects combining 3D printed parts with electronics",
  //       iconName: "Zap",
  //     },
  //     {
  //       title: "Innovation & Creativity",
  //       description: "Develop creative solutions using both technologies together",
  //       iconName: "Lightbulb",
  //     },
  //   ],
  //   courseOverview: "Our 3D Printing + Arduino course combines two powerful technologies to create innovative electronic projects. Students learn to design and print custom 3D objects using CAD software, then integrate them with Arduino microcontrollers and electronic components. This course covers everything from basic 3D modeling and printing techniques to Arduino programming and electronics. Students will build complete projects that combine 3D printed parts with sensors, motors, LEDs and other electronic components. By the end of the course, students will have the skills to create their own custom electronic devices with professionally designed enclosures and mechanical parts.",
  //   ageRange: "12+",
  //   category: "Electronics"
  // },
  peecee: {
    id: "peecee",
    title: "Peecee",
    subtitle:
      "Learn electronics, sensors, automation and robotics using the PeeCee microcontroller",
    badge: "Electronics & Robotics Course",
    description:
      "Master electronics, sensors, motor control, automation and robotics using the PeeCee (PIC) microcontroller through hands-on learning and real-world projects.",
    mode: "Offline",
    duration: "36 CLASSES (x3 LEVELS) (1 HOUR PER CLASS)",
    syllabusPath: "/assets/pdf/PeeCee_Curriculum.pdf",
    syllabusFileName: "PeeCee_Curriculum.pdf",
    imagePath: "/assets/classroom-course/peecee.webp",
    imageAlt: "PeeCee Microcontroller Course",
    price: 7999,
    originalPrice: 11999,
    currency: "INR",
    locale: "en-IN",

    keyFeatures: [
      {
        title: "Microcontroller Programming",
        description:
          "Learn basics of the PeeCee (PIC) microcontroller and embedded logic.",
        iconName: "Cpu",
      },
      {
        title: "Hands-on Electronics",
        description:
          "Work with LEDs, sensors, motors and real electronic components.",
        iconName: "CircuitBoard",
      },
      {
        title: "Automation Projects",
        description:
          "Build burglar alarms, automation systems and interactive machines.",
        iconName: "Activity",
      },
      {
        title: "Robotics Development",
        description:
          "Create robots, smart machines and motor-controlled systems.",
        iconName: "Bot",
      },
    ],

    courseOverview:
      "The PeeCee Course introduces students to electronics, programming, automation and robotics using the PIC microcontroller. Through hands-on projects, students learn sensor inputs, motor control, logic building and smart machine development. Each level progressively develops skills—from basic electronics to advanced automation and robotics.",

    ageRange: "6-9",
    category: "Electronics",
  },

  "simple-powered-machines": {
    id: "simplePoweredMachines",
    title: "Simple Powered Machines",
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
    courseOverview:
      "Simple Powered Machines focuses on mechanical systems that use motors and power sources. Students learn about electric motors, power transmission systems, gears and control mechanisms. This course teaches the principles of powered mechanical systems and how to design and build motor-driven devices.",
    ageRange: "6-9",
    category: "Lego-Robotics",
  },

  "early-electronics": {
    id: "earlyElectronics",
    title: "Early Electronics",
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
    courseOverview:
      "Our Early Electronics course provides a solid foundation in electronics for beginners. Students will explore electronic components, understand how they work and build various circuits. The course is divided into two levels, covering topics from basic electricity and components to more advanced concepts like transistors and integrated circuits. Through hands-on projects, students will gain practical experience in building electronic devices including a smart watch display, burglar alarms and more.",
    ageRange: "9-11",
    category: "Electronics",
  },
  drone: {
    id: "drone",
    title: "Drone",
    subtitle: "Learn to build and fly drones with LEGO Education SPIKE",
    badge: "Drone Building Course",
    description: "Learn to build and fly drones with LEGO Education SPIKE",
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
        title: "Drone Building",
        description: "Learn to build drones using LEGO Education SPIKE",
        iconName: "Builder",
      },
      {
        title: "Flight Controls",
        description: "Understand pitch, roll and yaw controls",
        iconName: "Cog",
      },
      {
        title: "Sensor Integration",
        description: "Work with various sensors for navigation and control",
        iconName: "Zap",
      },
      {
        title: "Automation",
        description: "Create automated drone flight patterns",
        iconName: "Bot",
      },
    ],
    courseOverview:
      "Our Drone course teaches students how to build and fly drones using LEGO Education SPIKE. Students learn about drone design, flight controls and sensor integration. They build working drones and learn how to control them using programming. This course combines engineering, technology and creativity, providing students with a fun and engaging way to learn about robotics and automation.",
    ageRange: "4+",
    category: "Drone Technology",
  },
  //   "iot": {
  //   id: "iot",
  //   title: "Internet of Things (IoT)",
  //   subtitle: "Connect devices and create smart systems that communicate over the internet",
  //   badge: "Connected Technology Course",
  //   description: "Connect devices and create smart systems that communicate over the internet",
  //   mode: "Online & Offline",
  //   duration: "16 CLASSES (x4 LEVELS) (1 HOUR PER CLASS)",
  //   syllabusPath: "/assets/pdf/INTERNET OF THINGS.pdf",
  //   syllabusFileName: "IOT.pdf",
  //   imagePath: "/assets/classroom-course/iot.webp",
  //   imageAlt: "IoT Course",
  //   price: 16999,
  //   originalPrice: 23999,
  //   currency: "INR",
  //   locale: "en-IN",
  //   keyFeatures: [
  //     {
  //       title: "Device Connectivity",
  //       description: "Learn to connect devices to the internet",
  //       iconName: "Wifi",
  //     },
  //     {
  //       title: "Sensor Integration",
  //       description: "Work with various sensors and data collection",
  //       iconName: "Zap",
  //     },
  //     {
  //       title: "Smart Systems",
  //       description: "Create intelligent automated systems",
  //       iconName: "Bot",
  //     },
  //     {
  //       title: "Data Processing",
  //       description: "Process and analyze IoT data streams",
  //       iconName: "Database",
  //     },
  //   ],
  //   courseOverview: "Internet of Things (IoT) is the network of physical devices connected to the internet. Our IoT course teaches students to build smart systems that can collect data, communicate with other devices and automate processes. Students learn about sensors, microcontrollers, wireless communication and cloud platforms to create connected solutions for real-world problems.",
  //   ageRange: "11-16",
  //   category: "Electronics"
  // },
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
    courseOverview:
      "Our Coding with AI course teaches students how to integrate AI into their code using Pictoblox. Students learn about AI concepts, programming fundamentals and how to use Pictoblox to create automated systems. This course provides a fun and engaging way to learn about coding, problem-solving and automation.",
    ageRange: "7-11",
    category: "Programming",
  },
};
