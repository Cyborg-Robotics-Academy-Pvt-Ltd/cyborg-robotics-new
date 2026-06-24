export interface RoadmapMentor {
  name: string;
  role: string;
  image: string;
  bio: string;
}

export interface RoadmapSubModule {
  name: string;
  sessions: string[];
}

export interface RoadmapPhase {
  id: string;
  order: number;
  label: string;
  title: string;
  icon: string;
  isFinal?: boolean;
  description: string;
  skills: string[];
  subModules: RoadmapSubModule[];
  capstone?: string;
  duration?: string;
  mentor: RoadmapMentor;
}

export const roadmapPhases: RoadmapPhase[] = [
  {
    id: "mechanical-robotics",
    order: 1,
    label: "PHASE 01",
    title: "Mechanical Robotics",
    icon: "Bot",
    mentor: {
      name: "John Anderson",
      role: "Mechanical Robotics Mentor",
      image: "/assets/year-long-course/mentors/IMG_7417.JPG",
      bio: "Specialist in LEGO Robotics, EV3 systems, Quarky robotics, and STEM education.",
    },
    description:
      "Kicks off with a design-thinking orientation, then moves through Spike Prime/EV3 builds, Quarky robotics control, and intro app/site design — closing with a capstone build.",
    skills: [
      "Spike Prime",
      "EV3",
      "Quarky",
      "Google Sites",
      "Design Thinking",
    ],
    subModules: [
      {
        name: "Orientation Day",
        sessions: ["Design Thinking"],
      },
      {
        name: "Spike Prime + EV3",
        sessions: [
          "Quality Check Robot",
          "Smart Bike",
          "Driving Base with Ultrasonic Sensor",
          "Colour Sorter",
        ],
      },
      {
        name: "Quarky Robotics",
        sessions: [
          "Robot Control & Expressions",
          "Smart Navigation with Sensors",
          "Actuators & Pick-and-Place Mechanism",
          "Creative Computing with Fruit Piano",
        ],
      },
      {
        name: "App Designing + Google Sites",
        sessions: [
          "Google Sites Fundamentals",
          "Website Creation",
          "Doodle Making",
        ],
      },
    ],
    capstone: "Mechanical Module Capstone",
  },

  {
    id: "electronics",
    order: 2,
    label: "PHASE 02",
    title: "Electronics & Arduino",
    icon: "Cpu",
    mentor: {
      name: "David Wilson",
      role: "Electronics & Arduino Mentor",
      image: "https://randomuser.me/api/portraits/men/45.jpg",
      bio: "Expert in circuits, sensors, Arduino programming, and embedded systems.",
    },
    description:
      "Builds from foundational electronics theory into hands-on Arduino programming, culminating in a hand-follower robot mega project.",
    skills: [
      "Circuit Design",
      "Sensors",
      "Arduino IDE",
      "C++ Basics",
    ],
    subModules: [
      {
        name: "Early + Mini Electronics",
        sessions: [
          "Introduction to Electronics",
          "Logic and Control",
          "Sensors and Components",
          "Applications and Advanced Components",
        ],
      },
      {
        name: "Arduino (8hr Bot Camp)",
        sessions: [
          "Introduction to Robotics & Arduino",
          "LED Blinking & Basic Electronics (Mini Project Day)",
          "Sensors & Motion: Understanding the Hand Follower Robot",
          "Building & Testing the Hand Follower Robot (Mega Project)",
        ],
      },
    ],
    capstone: "Electronics Module Capstone",
  },

  {
    id: "3d-printing-design",
    order: 3,
    label: "PHASE 03",
    title: "3D Printing & Design",
    icon: "Box",
    mentor: {
      name: "Sarah Mitchell",
      role: "3D Design Mentor",
      image: "https://randomuser.me/api/portraits/women/44.jpg",
      bio: "Experienced in CAD modelling, prototyping, and additive manufacturing.",
    },
    description:
      "Introduces CAD fundamentals in Tinkercad, mini prints, then slicing software ahead of a full interior/exterior house mega project.",
    skills: [
      "Tinkercad",
      "Slicer Software",
      "3D Printing",
      "CAD Modeling",
    ],
    subModules: [
      {
        name: "3D Printing (3DP)",
        sessions: [
          "Introduction to 3D Printing & Tinkercad Interface",
          "Using Tools & Shapes: Mini Projects (Rocket + Keychain)",
          "Introduction to Slicer + Start of Mega Project (Interior or Exterior of House)",
          "Continue & Complete Mega Project",
        ],
      },
    ],
    capstone: "3D Printing Module Capstone",
  },

  {
    id: "coding",
    order: 4,
    label: "PHASE 04",
    title: "Python & Game Dev",
    icon: "Code2",
    mentor: {
      name: "Michael Roberts",
      role: "Python & Game Development Mentor",
      image: "https://randomuser.me/api/portraits/men/62.jpg",
      bio: "Passionate about Python, software development, and game programming.",
    },
    description:
      "Covers Python fundamentals, Turtle graphics game-building, and Spike+Python integration projects, plus a financial literacy track.",
    skills: [
      "Python",
      "Tkinter",
      "Turtle Graphics",
      "Game Logic",
      "Spike + Python",
    ],
    subModules: [
      {
        name: "Python",
        sessions: [
          "Python Basics + Input/Output",
          "Conditional Logic + Functions",
          "Loops + Error Handling + Modular Design",
          "GUI Calculator using Tkinter",
        ],
      },
      {
        name: "Python (Turtle Graphics / Game Dev)",
        sessions: [
          "Introduction to Turtle Graphics",
          "Animation & Keyboard Control",
          "Game Setup – Jumping, Gravity & Obstacle Movement",
          "Final Game – Scoring, Collision, and Game Over (Dino Game)",
        ],
      },
      {
        name: "Spike + Python",
        sessions: [
          "Music Maker",
          "Grabber",
          "Ferris Wheel",
          "Weather Forecaster",
        ],
      },
      {
        name: "Financial Literacy",
        sessions: [],
      },
    ],
    capstone: "Coding Module Capstone",
  },

  {
    id: "drone-arvr",
    order: 5,
    label: "PHASE 05",
    title: "Drone / AR-VR",
    icon: "Plane",
    mentor: {
      name: "James Carter",
      role: "Drone Technology Mentor",
      image: "https://randomuser.me/api/portraits/men/28.jpg",
      bio: "Certified drone trainer with expertise in UAV systems and flight control.",
    },
    description:
      "Covers drone fundamentals from safety and components through assembly, control, and stable flight.",
    skills: [
      "Drone Assembly",
      "Flight Control",
      "Safety Protocols",
      "Stability",
    ],
    subModules: [
      {
        name: "Drones",
        sessions: [
          "Introduction to Drones and Safety",
          "Drone Components and Working Principle",
          "Drone Assembly and Control",
          "Flying and Stability",
        ],
      },
    ],
    capstone: "Drone Technology Capstone",
  },

  {
    id: "innovation-expo",
    order: 6,
    label: "FINAL",
    title: "Innovation Expo & Certification",
    icon: "Trophy",
    isFinal: true,
    mentor: {
      name: "Emily Parker",
      role: "Lead Innovation Mentor",
      image: "https://randomuser.me/api/portraits/women/68.jpg",
      bio: "Guides students in innovation, presentation skills, project showcasing, and certification readiness.",
    },
    description:
      "Graduation day. Students present their capstone projects in a final showcase (Show & Tell) and receive certification.",
    skills: [
      "Project Presentation",
      "Public Speaking",
      "Portfolio Building",
    ],
    subModules: [
      {
        name: "Graduation",
        sessions: ["Final Showcase & Show and Tell"],
      },
    ],
  },
];