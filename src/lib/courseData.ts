// This file contains course data without JSX elements

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
  keyFeatures: CourseFeature[];
  courseOverview: string;
}

export const courseData: Record<string, CourseData> = {
  python: {
    id: "python",
    title: "PYTHON PROGRAMMING",
    subtitle: "Learn the world's fastest-growing programming language for web development, data science, AI and more",
    badge: "Most Popular Course",
    description: "Learn the world's fastest-growing programming language for web development, data science, AI and more",
    mode: "Online & Offline",
    duration: "16 CLASSES(x6 LEVELS) (1 HOUR PER CLASS)",
    syllabusPath: "/assets/pdf/PYTHON.pdf",
    syllabusFileName: "PYTHON.pdf",
    imagePath: "/assets/online-course/python.webp",
    imageAlt: "Python Programming Course",
    keyFeatures: [
      {
        title: "Core Programming",
        description: "Master fundamental programming concepts and Python syntax",
        iconName: "Code",
      },
      {
        title: "Web Development",
        description: "Build websites and web applications using Python frameworks",
        iconName: "Globe",
      },
      {
        title: "Data Analysis",
        description: "Process, analyze and visualize data with Python libraries",
        iconName: "LineChart",
      },
      {
        title: "AI & Machine Learning",
        description: "Create intelligent applications with Python ML frameworks",
        iconName: "BrainCircuit",
      },
    ],
    courseOverview: "Python is a powerful programming language that lets you work quickly and integrate systems more effectively. As a general-purpose, high-level language, Python allows you to focus on core functionality of applications by taking care of common programming tasks. Python's simple syntax emphasizes readability, reducing the cost of program maintenance. Its comprehensive standard library and interpreter are freely available for all major platforms, making it perfect for developing desktop GUI applications, websites, web applications, data analysis tools and even artificial intelligence systems. Our comprehensive course covers Python from basics to advanced concepts across six progressive levels.",
  },
  arduino: {
    id: "arduino",
    title: "Arduino",
    subtitle: "Build interactive electronics projects with Arduino programming and hardware integration",
    badge: "Electronics Course",
    description: "Build interactive electronics projects with Arduino programming and hardware integration",
    mode: "Offline",
    duration: "16 CLASSES (1 HOUR PER CLASS)",
    syllabusPath: "/assets/pdf/ARDUINO.pdf",
    syllabusFileName: "ARDUINO.pdf",
    imagePath: "/assets/classroom-course/arduino.webp",
    imageAlt: "Arduino Course",
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
        description: "Interface with real-world sensors to collect and process data",
        iconName: "Zap",
      },
      {
        title: "IoT Projects",
        description: "Create interactive projects and automated solutions",
        iconName: "Lightbulb",
      },
    ],
    courseOverview: "Arduino is an open-source electronics platform based on easy-to-use hardware and software. It's intended for anyone making interactive projects. Arduino boards are able to read inputs - light on a sensor, a finger on a button, or a Twitter message - and turn it into an output - activating a motor, turning on an LED, publishing something online. You can tell your board what to do by sending a set of instructions to the microcontroller on the board. Our comprehensive Arduino course covers everything from basic electronics concepts to advanced IoT projects.",
  },
  webDesigning: {
    id: "webDesigning",
    title: "Web Designing",
    subtitle: "Learn to build beautiful, responsive and interactive websites with HTML and CSS",
    badge: "Frontend Development Course",
    description: "Learn to build beautiful, responsive and interactive websites with HTML and CSS",
    mode: "Online & Offline",
    duration: "16 CLASSES (x4 LEVELS) (1 HOUR PER CLASS)",
    syllabusPath: "/assets/pdf/WEB DESIGN.pdf",
    syllabusFileName: "WEB DESIGN.pdf",
    imagePath: "/assets/online-course/webdesigning.webp",
    imageAlt: "Web Designing Course",
    keyFeatures: [
      {
        title: "HTML Fundamentals",
        description: "Learn the core building blocks of website structure and content",
        iconName: "Code",
      },
      {
        title: "CSS Styling",
        description: "Master styling techniques to create visually appealing websites",
        iconName: "Palette",
      },
      {
        title: "Responsive Design",
        description: "Create websites that adapt to different screen sizes and devices",
        iconName: "Layout",
      },
      {
        title: "Interactive Elements",
        description: "Add engaging features and interactive components to web pages",
        iconName: "Rocket",
      },
    ],
    courseOverview: "Web design encompasses many different skills and disciplines in the production and maintenance of websites. The different areas of web design include web graphic design; user interface design; authoring, including standardized code and proprietary software; user experience design; and search engine optimization. Our comprehensive web designing course covers HTML, CSS, responsive design, and modern web development practices to create stunning, functional websites.",
  },
  java: {
    id: "java",
    title: "JAVA PROGRAMMING",
    subtitle: "Master object-oriented programming with Java for enterprise applications and Android development",
    badge: "Enterprise Programming Course",
    description: "Master object-oriented programming with Java for enterprise applications and Android development",
    mode: "Online & Offline",
    duration: "16 CLASSES (x4 LEVELS) (1 HOUR PER CLASS)",
    syllabusPath: "/assets/pdf/JAVA.pdf",
    syllabusFileName: "JAVA.pdf",
    imagePath: "/assets/online-course/java.webp",
    imageAlt: "Java Programming Course",
    keyFeatures: [
      {
        title: "Object-Oriented Programming",
        description: "Learn OOP concepts like inheritance, polymorphism, and encapsulation",
        iconName: "Code",
      },
      {
        title: "Enterprise Development",
        description: "Build scalable applications for enterprise environments",
        iconName: "Database",
      },
      {
        title: "Android Development",
        description: "Create mobile applications using Java for Android platform",
        iconName: "Smartphone",
      },
      {
        title: "Advanced Java Features",
        description: "Master collections, multithreading, and Java frameworks",
        iconName: "Settings",
      },
    ],
    courseOverview: "Java is a high-level, class-based, object-oriented programming language that is designed to have as few implementation dependencies as possible. It is a general-purpose programming language intended to let programmers write once, run anywhere, meaning that compiled Java code can run on all platforms that support Java without the need to recompile. Our comprehensive Java course covers everything from basic syntax to advanced enterprise development concepts.",
  },
  androidStudio: {
    id: "androidStudio",
    title: "ANDROID STUDIO",
    subtitle: "Build professional Android applications using Android Studio and modern development practices",
    badge: "Mobile Development Course",
    description: "Build professional Android applications using Android Studio and modern development practices",
    mode: "Online & Offline",
    duration: "16 CLASSES (x4 LEVELS) (1 HOUR PER CLASS)",
    syllabusPath: "/assets/pdf/ANDROID STUDIO.pdf",
    syllabusFileName: "ANDROID STUDIO.pdf",
    imagePath: "/assets/classroom-course/androidstudio.png",
    imageAlt: "Android Studio Course",
    keyFeatures: [
      {
        title: "Android Development",
        description: "Learn to build native Android applications using Java/Kotlin",
        iconName: "Smartphone",
      },
      {
        title: "UI/UX Design",
        description: "Create beautiful and intuitive user interfaces for mobile apps",
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
    courseOverview: "Android Studio is the official integrated development environment for Google's Android operating system, built on JetBrains' IntelliJ IDEA software and designed specifically for Android development. Our comprehensive Android Studio course covers everything from setting up the development environment to publishing apps on the Google Play Store, including modern Android development practices and the latest features.",
  },
  machineLearning: {
    id: "machineLearning",
    title: "MACHINE LEARNING",
    subtitle: "Master the fundamentals of machine learning and build intelligent applications",
    badge: "AI & Data Science Course",
    description: "Master the fundamentals of machine learning and build intelligent applications",
    mode: "Online & Offline",
    duration: "16 CLASSES (x4 LEVELS) (1 HOUR PER CLASS)",
    syllabusPath: "/assets/pdf/MACHINE LEARNING.pdf",
    syllabusFileName: "MACHINE LEARNING.pdf",
    imagePath: "/assets/online-course/machine-learning.webp",
    imageAlt: "Machine Learning Course",
    keyFeatures: [
      {
        title: "ML Fundamentals",
        description: "Learn core machine learning concepts and algorithms",
        iconName: "BrainCircuit",
      },
      {
        title: "Data Processing",
        description: "Master data preprocessing and feature engineering techniques",
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
    courseOverview: "Machine Learning is a subset of artificial intelligence that enables computers to learn and make decisions from data without being explicitly programmed. Our comprehensive machine learning course covers supervised and unsupervised learning, neural networks, deep learning, and practical applications in various industries. Students will learn to build and deploy machine learning models using popular frameworks like TensorFlow and scikit-learn.",
  },
  artificialIntelligence: {
    id: "artificialIntelligence",
    title: "ARTIFICIAL INTELLIGENCE",
    subtitle: "Explore the cutting-edge world of AI and build intelligent systems",
    badge: "Advanced AI Course",
    description: "Explore the cutting-edge world of AI and build intelligent systems",
    mode: "Online & Offline",
    duration: "16 CLASSES (x4 LEVELS) (1 HOUR PER CLASS)",
    syllabusPath: "/assets/pdf/ARTIFICIAL INTELLIGENCE.pdf",
    syllabusFileName: "ARTIFICIAL INTELLIGENCE.pdf",
    imagePath: "/assets/online-course/aigif.webp",
    imageAlt: "Artificial Intelligence Course",
    keyFeatures: [
      {
        title: "AI Fundamentals",
        description: "Understand core AI concepts and problem-solving approaches",
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
        description: "Create AI systems that understand and generate human language",
        iconName: "MessageSquare",
      },
    ],
    courseOverview: "Artificial Intelligence is the simulation of human intelligence in machines that are programmed to think and learn like humans. Our comprehensive AI course covers machine learning, deep learning, computer vision, natural language processing, and robotics. Students will learn to build intelligent systems that can perform tasks that typically require human intelligence.",
  },
  roboticsEv3: {
    id: "roboticsEv3",
    title: "ROBOTICS EV3",
    subtitle: "Build and program intelligent robots using LEGO Mindstorms EV3",
    badge: "Robotics Course",
    description: "Build and program intelligent robots using LEGO Mindstorms EV3",
    mode: "Offline",
    duration: "16 CLASSES (x4 LEVELS) (1 HOUR PER CLASS)",
    syllabusPath: "/assets/pdf/EV3 ROBOTICS.pdf",
    syllabusFileName: "ROBOTICS EV3.pdf",
    imagePath: "/assets/classroom-course/ev3.webp",
    imageAlt: "Robotics EV3 Course",
    keyFeatures: [
      {
        title: "Robot Building",
        description: "Learn mechanical engineering principles through hands-on robot construction",
        iconName: "Bot",
      },
      {
        title: "Programming Robots",
        description: "Program robots to perform complex tasks and solve problems",
        iconName: "Code",
      },
      {
        title: "Sensor Integration",
        description: "Use various sensors to make robots aware of their environment",
        iconName: "Zap",
      },
      {
        title: "Competition Ready",
        description: "Prepare for robotics competitions and challenges",
        iconName: "Trophy",
      },
    ],
    courseOverview: "LEGO Mindstorms EV3 is a robotics kit that allows students to build and program robots. Our comprehensive robotics course combines mechanical engineering, programming, and problem-solving skills. Students will learn to design, build, and program robots that can navigate mazes, pick up objects, and compete in various challenges.",
  },
  spikePrime: {
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
    keyFeatures: [
      {
        title: "Block-based Programming",
        description: "Learn programming concepts using intuitive drag-and-drop blocks",
        iconName: "Blocks",
      },
      {
        title: "STEAM Learning",
        description: "Integrate Science, Technology, Engineering, Arts, and Mathematics",
        iconName: "GraduationCap",
      },
      {
        title: "Creative Problem Solving",
        description: "Develop critical thinking through hands-on robotics projects",
        iconName: "Lightbulb",
      },
      {
        title: "Real-world Applications",
        description: "Apply robotics concepts to solve everyday problems",
        iconName: "Rocket",
      },
    ],
    courseOverview: "LEGO Education SPIKE Prime is a STEAM learning solution that combines colorful LEGO building elements, easy-to-use hardware, and an intuitive drag-and-drop coding language based on Scratch. Our comprehensive SPIKE Prime course helps students develop critical thinking and problem-solving skills through engaging robotics projects.",
  },
  printing3d: {
    id: "printing3d",
    title: "3D PRINTING",
    subtitle: "Learn to design and print 3D objects using modern 3D printing technology",
    badge: "Digital Manufacturing Course",
    description: "Learn to design and print 3D objects using modern 3D printing technology",
    mode: "Offline",
    duration: "16 CLASSES (x4 LEVELS) (1 HOUR PER CLASS)",
    syllabusPath: "/assets/pdf/3D PRINTING.pdf",
    syllabusFileName: "3D PRINTING.pdf",
    imagePath: "/assets/classroom-course/printing3d.webp",
    imageAlt: "3D Printing Course",
    keyFeatures: [
      {
        title: "3D Design",
        description: "Learn to create 3D models using CAD software",
        iconName: "Printer",
      },
      {
        title: "Printing Technology",
        description: "Understand different 3D printing technologies and materials",
        iconName: "Cog",
      },
      {
        title: "Post-processing",
        description: "Learn techniques to finish and improve 3D printed objects",
        iconName: "Brush",
      },
      {
        title: "Project-based Learning",
        description: "Create practical projects from concept to finished product",
        iconName: "Rocket",
      },
    ],
    courseOverview: "3D printing is a manufacturing process that creates three-dimensional objects by depositing materials layer by layer. Our comprehensive 3D printing course covers 3D design, slicing software, printing technology, and post-processing techniques. Students will learn to design and print their own 3D objects using modern 3D printing technology.",
  },
  bambinoCoding: {
    id: "bambinoCoding",
    title: "BAMBINO CODING",
    subtitle: "Introduce young minds to programming with fun, interactive coding activities",
    badge: "Kids Programming Course",
    description: "Introduce young minds to programming with fun, interactive coding activities",
    mode: "Online & Offline",
    duration: "16 CLASSES (x4 LEVELS) (1 HOUR PER CLASS)",
    syllabusPath: "/assets/pdf/BAMBINO CODING.pdf",
    syllabusFileName: "BAMBINO CODING.pdf",
    imagePath: "/assets/online-course/bambino.webp",
    imageAlt: "Bambino Coding Course",
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
    courseOverview: "Bambino Coding is designed specifically for young learners to introduce them to the exciting world of programming. Using age-appropriate tools and visual programming languages, children learn to create games, animations, and interactive stories while developing essential computational thinking skills. Our course makes coding fun and accessible, building a strong foundation for future learning.",
  },
  electronics: {
    id: "electronics",
    title: "ELECTRONICS",
    subtitle: "Learn the fundamentals of electronic circuits and electronic components",
    badge: "Electronics Course",
    description: "Learn the fundamentals of electronic circuits and electronic components",
    mode: "Offline",
    duration: "16 CLASSES (x4 LEVELS) (1 HOUR PER CLASS)",
    syllabusPath: "/assets/pdf/ELECTRONICS.pdf",
    syllabusFileName: "ELECTRONICS.pdf",
    imagePath: "/assets/classroom-course/electronics.webp",
    imageAlt: "Electronics Course",
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
    courseOverview: "Electronics is the foundation of modern technology. Our comprehensive electronics course covers everything from basic circuit theory to advanced electronic systems. Students learn to work with electronic components, design circuits, and build practical projects. This course provides hands-on experience with real electronic components and teaches essential skills for understanding and working with electronic devices.",
  },
  animationCoding: {
    id: "animationCoding",
    title: "ANIMATION CODING",
    subtitle: "Create stunning animations and visual effects through programming",
    badge: "Creative Programming Course",
    description: "Create stunning animations and visual effects through programming",
    mode: "Online & Offline",
    duration: "16 CLASSES (x4 LEVELS) (1 HOUR PER CLASS)",
    syllabusPath: "/assets/pdf/ANIMATION AND CODING.pdf",
    syllabusFileName: "ANIMATION CODING.pdf",
    imagePath: "/assets/online-course/animation-coding.webp",
    imageAlt: "Animation Coding Course",
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
    courseOverview: "Animation Coding combines the power of programming with the creativity of visual arts. Students learn to create stunning animations, interactive graphics, and visual effects using code. This course teaches both the technical skills of animation programming and the artistic principles of visual design, allowing students to bring their creative ideas to life through code.",
  },
  appDesigning: {
    id: "appDesigning",
    title: "APP DESIGNING",
    subtitle: "Design beautiful and functional mobile applications with modern UI/UX principles",
    badge: "Mobile Design Course",
    description: "Design beautiful and functional mobile applications with modern UI/UX principles",
    mode: "Online & Offline",
    duration: "16 CLASSES (x4 LEVELS) (1 HOUR PER CLASS)",
    syllabusPath: "/assets/pdf/APP DESIGNING.pdf",
    syllabusFileName: "APP DESIGNING.pdf",
    imagePath: "/assets/online-course/appdesigning.webp",
    imageAlt: "App Designing Course",
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
    courseOverview: "App Designing focuses on creating user-friendly and visually appealing mobile applications. Students learn modern UI/UX design principles, user research, wireframing, prototyping, and using industry-standard design tools. This course prepares students to design mobile apps that are both beautiful and functional, with a focus on user experience and accessibility.",
  },
  earlySimpleMachines: {
    id: "earlySimpleMachines",
    title: "EARLY SIMPLE MACHINES",
    subtitle: "Explore basic mechanical principles through hands-on building and experimentation",
    badge: "Mechanical Engineering Course",
    description: "Explore basic mechanical principles through hands-on building and experimentation",
    mode: "Offline",
    duration: "16 CLASSES (x4 LEVELS) (1 HOUR PER CLASS)",
    syllabusPath: "/assets/pdf/EARLY SIMPLE MACHINES.pdf",
    syllabusFileName: "EARLY SIMPLE MACHINES.pdf",
    imagePath: "/assets/classroom-course/earlysimple.webp",
    imageAlt: "Early Simple Machines Course",
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
    courseOverview: "Early Simple Machines introduces students to fundamental mechanical principles through hands-on building and experimentation. Students learn about levers, pulleys, gears, and other simple machines while constructing working models. This course builds a strong foundation in mechanical engineering concepts and develops problem-solving skills through practical projects.",
  },
  iot: {
    id: "iot",
    title: "INTERNET OF THINGS (IoT)",
    subtitle: "Connect devices and create smart systems that communicate over the internet",
    badge: "Connected Technology Course",
    description: "Connect devices and create smart systems that communicate over the internet",
    mode: "Online & Offline",
    duration: "16 CLASSES (x4 LEVELS) (1 HOUR PER CLASS)",
    syllabusPath: "/assets/pdf/INTERNET OF THINGS.pdf",
    syllabusFileName: "IOT.pdf",
    imagePath: "/assets/classroom-course/iot.webp",
    imageAlt: "IoT Course",
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
    courseOverview: "Internet of Things (IoT) is the network of physical devices connected to the internet. Our IoT course teaches students to build smart systems that can collect data, communicate with other devices, and automate processes. Students learn about sensors, microcontrollers, wireless communication, and cloud platforms to create connected solutions for real-world problems.",
  },
  spikePneumatics: {
    id: "spikePneumatics",
    title: "SPIKE PNEUMATICS",
    subtitle: "Learn pneumatic systems and air-powered mechanisms with LEGO Education SPIKE",
    badge: "Pneumatic Systems Course",
    description: "Learn pneumatic systems and air-powered mechanisms with LEGO Education SPIKE",
    mode: "Offline",
    duration: "16 CLASSES (x4 LEVELS) (1 HOUR PER CLASS)",
    syllabusPath: "/assets/pdf/Spike Essential and Pneumatics.pdf",
    syllabusFileName: "Spike Essential.pdf",
    imagePath: "/assets/classroom-course/pneumatics.webp",
    imageAlt: "SPIKE Pneumatics Course",
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
    courseOverview: "SPIKE Pneumatics introduces students to pneumatic systems using LEGO Education SPIKE components. Students learn about air pressure, flow control, and pneumatic mechanisms while building working models. This course combines mechanical engineering with automation concepts, teaching students to design and control air-powered systems.",
  },
  simplePoweredMachines: {
    id: "simplePoweredMachines",
    title: "SIMPLE POWERED MACHINES",
    subtitle: "Explore powered mechanical systems and motor-driven mechanisms",
    badge: "Powered Systems Course",
    description: "Explore powered mechanical systems and motor-driven mechanisms",
    mode: "Offline",
    duration: "16 CLASSES (x4 LEVELS) (1 HOUR PER CLASS)",
    syllabusPath: "/assets/pdf/SIMPLE AND POWER MACHINE.pdf",
    syllabusFileName: "SIMPLE AND POWER MACHINE.pdf",
    imagePath: "/assets/classroom-course/simple-powered-machines.webp",
    imageAlt: "Simple Powered Machines Course",
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
    courseOverview: "Simple Powered Machines focuses on mechanical systems that use motors and power sources. Students learn about electric motors, power transmission systems, gears, and control mechanisms. This course teaches the principles of powered mechanical systems and how to design and build motor-driven devices.",
  },
  appLab: {
    id: "appLab",
    title: "APP LAB",
    subtitle: "Create mobile applications using MIT App Inventor and block-based programming",
    badge: "Mobile App Development Course",
    description: "Create mobile applications using MIT App Inventor and block-based programming",
    mode: "Online & Offline",
    duration: "16 CLASSES (x4 LEVELS) (1 HOUR PER CLASS)",
    syllabusPath: "/assets/pdf/App Lab.pdf",
    syllabusFileName: "APP LAB.pdf",
    imagePath: "/assets/classroom-course/applab.png",
    imageAlt: "App Lab Course",
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
    courseOverview: "App Lab uses MIT App Inventor to teach mobile app development through block-based programming. Students learn to create functional mobile applications without complex coding, focusing on user interface design, app logic, and testing. This course makes app development accessible to beginners while teaching important programming concepts.",
  },
  // Add more courses as needed...
};

export const getCourseData = (courseId: string): CourseData | null => {
  return courseData[courseId] || null;
};

export const getAllCourseIds = (): string[] => {
  return Object.keys(courseData);
};
