export interface CourseTaskTemplate {
  task: string;
}

export type CourseTaskMap = Record<
  string,
  Record<string, CourseTaskTemplate[]>
>;

function tasks(names: string[]): CourseTaskTemplate[] {
  return names.map((task) => ({ task }));
}

function withLevels(levels: Record<string, string[]>) {
  return Object.fromEntries(
    Object.entries(levels).map(([level, levelTasks]) => [
      level,
      tasks(levelTasks),
    ]),
  );
}

function alias(map: CourseTaskMap, source: string, aliases: string[]) {
  aliases.forEach((name) => {
    map[name] = map[source];
  });
}

export const courseTasks: CourseTaskMap = {
python: withLevels({
  "1": [
    "Introduction to Python",
    "Introduction of turtle",
    "Numbers and Variables",
    "Numbers and Variables",
    "Advanced Variables & Dynamic Typing",
    "Strings",
    "Advanced String Formatting",
    "Lists",
    "Lists",
    "Tuples",
    "Dictionaries",
    "Dictionaries",
    "Sets and Booleans",
    "Sets and Booleans",
    "Booleans & Comparison Operators",
    "If, Elif, and Else Statements",
  ],
  "2": [
    "For Loops",
    "While Loops",
    "Useful Operators",
    "List Comprehensions",
    "Methods",
    "Functions",
    "Lambda, Map & Filter",
    "Scope & Namespaces",
    "Args & Kwargs",
    "Modules & Packages",
    "Animation with Turtle",
    "Functions with Turtle Graphics",
    "Event Handling with Turtle",
    "Advanced Animation with Functions",
    "Working with Files",
    "Working with Files",
    
  ],
 
}),
 java: withLevels({
  "1": [
    "Java & IDE Setup",
    "JVM, JRE & JDK",
    "First Java Program",
    "Syntax & Keywords",
    "Output Statements",
    "Comments & Standards",
    "Variables & Data Types",
    "Type Casting & Operators",
    "Strings",
    "Math & Boolean",
    "If-Else & Switch",
    "Loops",
    "Break & Continue",
    "Arrays",
    "2D Arrays",
    "Calculator Project",
  ],
  "2": [
    "Methods",
    "Overloading & Scope",
    "Classes & Objects",
    "Constructors",
    "Encapsulation",
    "Inheritance",
    "Polymorphism",
    "Abstraction",
    "Interfaces",
    "Modifiers",
    "Static & Final",
    "Packages",
    "Inner Classes",
    "Recursion",
    "OOP Practice",
    "Student Management Project",
  ],
  "3": [
    "Scanner Input",
    "Exception Handling",
    "Custom Exceptions",
    "Wrapper Classes",
    "Collections",
    "ArrayList & LinkedList",
    "HashSet & TreeSet",
    "HashMap & TreeMap",
    "Iterators",
    "Comparable & Comparator",
    "Lambda Expressions",
    "Streams API",
    "Date & Time API",
    "File Handling",
    "Multithreading",
    "Task Manager Project",
  ],
}),
 arduino: withLevels({
  "1": [
    "Introduction to Arduino, LED & Resistor Basics + LED Blinking",
    "Traffic Light Simulation & LED Pattern Challenges",
    "Push Button & Buzzer Basics",
    "Push Button + Buzzer Challenges",
    "DHT11 Sensor (Temperature & Humidity) Basics",
    "DHT11 Sensor Challenges",
    "Ultrasonic Sensor (HC-SR04) Basics",
    "Ultrasonic Sensor Challenges",
    "Servo Motor & Potentiometer Basics",
    "Servo Motor + Potentiometer Challenges",
    "BO Motor & Motor Driver (L293D/L298N) Basics",
    "BO Motor + Motor Driver Challenges",
    "IR Sensor Basics",
    "IR Sensor Challenges",
    "Mega Project (obstacle avoidance / hand follower) – Part 1: Circuit Assembly",
    "Mega Project (obstacle avoidance / hand follower) – Part 2: Programming, Testing & Troubleshooting",
  ],

  "2": [
    "LDR Basics",
    "LDR Programming Challenges",
    "Keypad Module Basics",
    "Keypad Module Programming Challenges",
    "IR Remote & Receiver Basics",
    "IR Remote & Receiver Programming Challenges",
    "Flame Sensor Basics",
    "Flame Sensor Programming Challenges",
    "OLED Display Basics",
    "OLED Display Programming Challenges",
    "Joystick Module Basics",
    "Joystick Module Programming Challenges",
    "Sound Sensor Module Basics",
    "Sound Sensor Module Programming Challenges",
    "Mega Project (Wall-E Robot / Fire Fighting Robot) – Assembly",
    "Mega Project (Wall-E Robot / Fire Fighting Robot) – Programming & Testing",
  ],

  "3": [
    "PIR Sensor Basics",
    "PIR Sensor Programming Challenges",
    "Relay Module Basics",
    "Relay Module Programming Challenges",
    "HC-05 Bluetooth Module Basics",
    "HC-05 Bluetooth Module Programming Challenges",
    "Speaker with MIC and ISD1820PY Basics",
    "Speaker with MIC and ISD1820PY Programming Challenges",
    "Smoke/Gas Sensor (MQ-2) Basics",
    "Smoke/Gas Sensor (MQ-2) Programming Challenges",
    "RFID Tag Basics",
    "RFID Tag Programming Challenges",
    "Mega Project (Animetronic/bionic) – Assembly (Part 1)",
    "Mega Project (Animetronic/bionic) – Assembly (Part 2)",
    "Mega Project (Animetronic/bionic) – Programming & Testing",
    "Mega Project (Animetronic/bionic) – Troubleshooting & Final Testing",
  ],
}),
  "web designing": withLevels({
    "1": [
      "HTML page structure",
      "Headings paragraphs and links",
      "Images and lists",
      "Forms and inputs",
      "CSS selectors",
      "Colors and typography",
      "Box model practice",
      "Personal webpage project",
    ],
    "2": [
      "Flexbox layout",
      "CSS grid layout",
      "Responsive breakpoints",
      "Navigation bar build",
      "Cards and reusable sections",
      "Animations and transitions",
      "Landing page polish",
      "Responsive website demo",
    ],
    "3": [
      "JavaScript basics",
      "DOM selection",
      "Events and interactions",
      "Form validation",
      "Gallery or slider build",
      "Local storage practice",
      "Interactive app project",
      "Project review",
    ],
    "4": [
      "Database concept intro",
      "API request basics",
      "Project planning",
      "Dashboard layout",
      "Dynamic data rendering",
      "Testing responsive UI",
      "Portfolio final build",
      "Final website presentation",
    ],
  }),
  "android studio": withLevels({
    "1": [
      "Android Studio setup",
      "Project structure overview",
      "Layouts and views",
      "Buttons and click events",
      "Activities and intents",
      "Form screen build",
      "Simple calculator app",
      "Level 1 app demo",
    ],
    "2": [
      "RecyclerView basics",
      "Navigation between screens",
      "App themes and styling",
      "Local storage practice",
      "Permissions overview",
      "Media and images",
      "Notes app build",
      "Level 2 review",
    ],
    "3": [
      "API connection basics",
      "JSON parsing",
      "Authentication flow",
      "Database integration",
      "Error states and loading UI",
      "App testing session",
      "Weather app project",
      "Level 3 presentation",
    ],
    "4": [
      "Publishing checklist",
      "App icon and branding",
      "Performance basics",
      "Advanced UI polish",
      "Final app planning",
      "Final app build",
      "Bug fixing session",
      "Final app showcase",
    ],
  }),
  "artificial intelligence": withLevels({
    "1": [
      "AI concepts and examples",
      "Rule based intelligence",
      "Data and features",
      "Training vs testing",
      "Simple classifier activity",
      "AI ethics discussion",
      "Mini AI game",
      "Level 1 recap",
    ],
    "2": [
      "Machine learning workflow",
      "Image recognition basics",
      "Text classification basics",
      "Voice assistant activity",
      "Model accuracy practice",
      "Bias and fairness examples",
      "AI project planning",
      "Level 2 project demo",
    ],
    "3": [
      "Neural network concept",
      "Computer vision project",
      "Natural language processing",
      "Chatbot logic",
      "AI with sensors",
      "Project testing",
      "Capstone build",
      "Capstone review",
    ],
    "4": [
      "Advanced model design",
      "Dataset improvement",
      "Model deployment overview",
      "Prompt and response systems",
      "AI product thinking",
      "Documentation session",
      "Final AI solution",
      "Final presentation",
    ],
  }),
  "robotics ev3": withLevels({
    "1": [
      "EV3 kit and parts overview",
      "Robot base assembly",
      "Motor movement basics",
      "Turn and stop logic",
      "Touch sensor challenge",
      "Color sensor basics",
      "Maze movement practice",
      "Beginner robot challenge",
    ],
    "2": [
      "Ultrasonic sensor navigation",
      "Line follower basics",
      "Loop and switch blocks",
      "Gyro sensor practice",
      "Attachment design",
      "Object push challenge",
      "Robot testing session",
      "Intermediate challenge",
    ],
    "3": [
      "Advanced line following",
      "Mission strategy planning",
      "Multi sensor decisions",
      "Gear ratio experiments",
      "Robotic arm build",
      "Attachment optimization",
      "Competition run practice",
      "Advanced challenge",
    ],
    "4": [
      "Autonomous mission planning",
      "Reliability testing",
      "Code optimization",
      "Custom mechanism build",
      "Timed challenge practice",
      "Final robot tuning",
      "Competition simulation",
      "Expert showcase",
    ],
  }),
  "robotics with quarky": withLevels({
    "1": [
      "PictoBlox and Quarky setup",
      "Sprite control game",
      "Quarky emotion controls",
      "Robot movement shapes",
      "Ultrasonic sensor reading",
      "Servo sweep practice",
      "Obstacle avoiding robot",
      "Line follower intro",
    ],
    "2": [
      "Gripper robot overview",
      "Pick and place mechanism",
      "IR sensor calibration",
      "Autonomous steering",
      "Object tracking activity",
      "AI vision project",
      "Capstone robot build",
      "Quarky project demo",
    ],
  }),
"mini electronics": withLevels({
  "1": [
    "Intro to Electronics",
    "Energy to Output",
    "Controls and Movement",
    "TBD — S4 title missing",
    "Color Control System",
    "Adjustable Power — Part 1",
    "Adjustable Power — Part 2",
    "Color Magic",
    "Smart Color Control",
    "Smart Light Detection",
    "Smart Display System — Part 1",
    "Smart Display System — Part 2",
    "Project Day 1",
    "Project Day 2",
    "Project Day 3",
    "Challenge Day",
  ],
  "2": [
    "Smart Switching — Part 1",         // S1
    "Smart Switching — Part 2",         // S2
    "Electronics Switching Project",    // S3
    "Smart Door Alarm",                 // S4
    "Smart Street Light",               // S5
    "Power Storage Basics",             // S6
    "Invisible Object Detection",       // S7
    "Relay Basics",                     // S8
    "Autosense Bin",                    // S9
    "Watch the Movement",               // S10
    "Magic Timer Chip",                 // S11
    "Digital Logic Basics",             // S12
    "Heat Sense",                       // S13
    "Project Day — Part 1",             // S14
    "Project Day — Part 2",             // S15
    "Challenge Day",                    // S16
  ],
}),
  "spike essential": withLevels({
    "1": [
      "SPIKE Essential kit intro",
      "Motor movement basics",
      "Color sensor activity",
      "Sound and light blocks",
      "Simple machine build",
      "Story based robot challenge",
      "Creative build session",
      "Project sharing",
    ],
  }),
  "spike prime": withLevels({
    "1": [
      "SPIKE Prime kit overview",
      "Hub and motor setup",
      "Movement blocks",
      "Sensor based decisions",
      "Build a moving rover",
      "Color sensor challenge",
      "Mini mission practice",
      "Level 1 robot demo",
    ],
    "2": [
      "Math in robot motion",
      "Loops and variables",
      "Line following logic",
      "Gyro turn practice",
      "Attachment build",
      "Mission strategy",
      "Robot reliability testing",
      "Level 2 challenge",
    ],
    "3": [
      "Advanced sensor fusion",
      "Robotics control mechanisms",
      "Data based decisions",
      "Competition mission build",
      "Autonomous navigation",
      "Debugging robot code",
      "Capstone build",
      "Level 3 showcase",
    ],
    "4": [
      "Smart automation concept",
      "IoT style robot workflow",
      "Advanced mechanism design",
      "Project planning board",
      "Prototype and iterate",
      "Testing and tuning",
      "Final robot solution",
      "Expert demo day",
    ],
  }),
  "spike prime + python": withLevels({
    "1": [
      "Python setup for SPIKE",
      "Hub display and sounds",
      "Motor control with Python",
      "Sensor input basics",
      "Loops and conditions",
      "Model based robot build",
      "Mini automation task",
      "Level 1 demo",
    ],
    "2": [
      "Advanced Python functions",
      "Data from sensors",
      "Precise turns and control",
      "Reusable robot commands",
      "Navigation challenge",
      "Debugging Python robot code",
      "Automation project",
      "Level 2 presentation",
    ],
    "3": [
      "Advanced line following",
      "PID concept intro",
      "Mission route planning",
      "Custom attachment logic",
      "Robot reliability testing",
      "Competition simulation",
      "Final robot code",
      "Project showcase",
    ],
  }),
"3d printing": withLevels({
  "1": [
    "Introduction to 3D Printing & Keychain Design",
    "3D Printer Components & Setup",
    "Tinkercad Basics & Rocket Design",
    "Duplicate & Flip Tools",
    "Racer Car Design",
    "Snap-Fit Box Design",
    "Introduction to Slicer Software",
    "Slicer Settings",
    "Phone Stand Design",
    "Supports & Model Orientation",
    "House Design – Part 1",
    "House Design – Part 2",
    "Hinged Box Design",
    "Hinged Box Testing & Improvement",
    "Desk Organizer Design",
    "Maze Puzzle Design",
  ],

  "2": [
    "Introduction to Fusion 360 & Functional Design",
    "Fusion 360 Interface & Navigation",
    "Dimensions, Parameters & Constraints",
    "Loft & Fillet Tools",
    "Vernier Caliper & STEP File Import",
    "Introduction to Blender",
    "STL Editing in Blender",
    "Mesh Editing in Fusion 360",
    "Multi-Part Assembly Design",
    "Tolerance in 3D Design",
    "Functional Product Design",
    "Joints & Motion Simulation",
    "Sliding Drawer Mechanism",
    "Multi-Part Project Planning",
    "Project Development & Assembly",
    "Final Project Presentation",
  ],

  "3": [
    "Advanced 3D Printing Concepts",
    "Print Strength & Orientation",
    "Modular Design",
    "Snap-Fit & Hinge Design",
    "Multi-Part Assembly",
    "Architectural Modeling",
    "Threaded Design",
    "Jigs & Fixtures",
    "Medical & Assistive Design",
    "Robotics Components",
    "Gears & Motion Transfer",
    "Electronics Enclosure Design",
    "Project Planning & Design",
    "Rapid Prototyping",
    "Print Troubleshooting",
    "Final Project Presentation",
  ],
}),
  "bambino coding": withLevels({
    "1": [
      "Coding blocks introduction",
      "Sequencing with animations",
      "Loops with patterns",
      "Events and clicks",
      "Make a moving character",
      "Simple game rules",
      "Story project build",
      "Fun coding showcase",
    ],
  }),
  electronics: withLevels({
    "1": [
      "Components and symbols",
      "Series circuit build",
      "Parallel circuit build",
      "LED and resistor practice",
      "Switch logic circuits",
      "Breadboard basics",
      "Simple alarm project",
      "Level 1 recap",
    ],
    "2": [
      "Capacitors and timing",
      "Diodes and polarity",
      "Transistor switching",
      "Sensor circuits",
      "Motor driver basics",
      "IC based activity",
      "Troubleshooting practice",
      "Level 2 project",
    ],
    "3": [
      "Advanced sensor modules",
      "Display output circuits",
      "Power management basics",
      "Signal testing",
      "Automation circuit build",
      "Project debugging",
      "Capstone circuit",
      "Project presentation",
    ],
  }),
  "animation & coding": withLevels({
    "1": [
      "Animation blocks intro",
      "Character movement",
      "Costumes and scenes",
      "Events and timing",
      "Loops for animation",
      "Interactive story build",
      "Mini game animation",
      "Level 1 showcase",
    ],
    "2": [
      "Advanced motion effects",
      "Variables for scoring",
      "Clone based animation",
      "Physics style movement",
      "Sound and scene polish",
      "Debugging animation flow",
      "Final animation project",
      "Project screening",
    ],
  }),
  "app designing": withLevels({
    "1": [
      "UI and UX basics",
      "Mobile screen planning",
      "Wireframe sketching",
      "Color and typography",
      "Button and form design",
      "Prototype flow",
      "Usability review",
      "App concept presentation",
    ],
    "2": [
      "Design system basics",
      "Component reuse",
      "Navigation patterns",
      "Accessibility basics",
      "High fidelity mockup",
      "Interactive prototype",
      "Feedback and iteration",
      "Level 2 review",
    ],
    "3": [
      "User research activity",
      "Persona and journey map",
      "Dashboard design",
      "Responsive layouts",
      "Micro interaction planning",
      "Design handoff basics",
      "Portfolio case study",
      "Project critique",
    ],
    "4": [
      "Product design strategy",
      "Design sprint activity",
      "Advanced prototyping",
      "Design QA session",
      "Final app redesign",
      "Presentation deck",
      "Portfolio polish",
      "Final showcase",
    ],
  }),
  "early simple machines": withLevels({
    "1": [
      "Simple machines introduction",
      "Lever build activity",
      "Pulley experiment",
      "Wheel and axle model",
      "Inclined plane challenge",
      "Gear movement basics",
      "Build a mini vehicle",
      "Level 1 sharing",
    ],
    "2": [
      "Compound machines",
      "Crane mechanism",
      "Measuring car build",
      "Fishing rod model",
      "Force and balance activity",
      "Problem solving challenge",
      "Creative machine build",
      "Project showcase",
    ],
  }),
  "simple powered machines": withLevels({
    "1": [
      "Motor and battery basics",
      "Powered car build",
      "Gear train practice",
      "Fan or spinner model",
      "Speed and torque test",
      "Sweeper car activity",
      "Build and race session",
      "Level 1 challenge",
    ],
    "2": [
      "Advanced gear systems",
      "Belt and pulley drive",
      "Launcher mechanism",
      "Merry go round model",
      "Control switch activity",
      "Powered machine challenge",
      "Design improvement session",
      "Project demo",
    ],
  }),
  "app lab": withLevels({
    "1": [
      "App Lab setup",
      "Screen and button basics",
      "Events and actions",
      "Variables in apps",
      "Input and output design",
      "Calculator app",
      "Quiz app build",
      "Level 1 demo",
    ],
    "2": [
      "Lists and data tables",
      "Navigation flow",
      "User input validation",
      "Image and media use",
      "Simple database activity",
      "Habit tracker build",
      "Testing and feedback",
      "Level 2 review",
    ],
    "3": [
      "API concept intro",
      "Dynamic data display",
      "App state management",
      "Design polish",
      "Debugging app logic",
      "Project planning",
      "Final app build",
      "Project presentation",
    ],
    "4": [
      "Advanced app architecture",
      "Reusable screens",
      "Performance and polish",
      "User testing session",
      "Publishing checklist",
      "Final iteration",
      "Portfolio documentation",
      "Expert app showcase",
    ],
  }),
  "kubo robotics": withLevels({
    "1": [
      "KUBO and TagTiles intro",
      "Route planning basics",
      "Sequencing challenge",
      "Function tiles practice",
      "Map navigation task",
      "Debug the route",
      "Story mission build",
      "Level 1 challenge",
    ],
    "2": [
      "Subroutines and loops",
      "Route optimization",
      "Maze mission practice",
      "Condition style thinking",
      "Problem solving challenge",
      "Team mission activity",
      "IRO style practice",
      "KUBO showcase",
    ],
  }),
peecee: withLevels({
  "1": [
    "Seeing, Hearing, Believing",                          // S1
    "PeeCee Add-ons: NextCross and Elegant Lights",        // S2
    "Scribbling Bot",                                       // S3
    "Basics of Motor and Switch",                           // S4
    "Rookie Programmer: Stand in Line, Disco Light, Hanger",// S5
    "Walking Dog — Part 1",                                 // S6
    "Walking Dog — Part 2",                                 // S7
    "Touch to Start and Automated Fan",                     // S8
    "Dependent on Light: Laser Burglar Alarm and Smart Night Lamp", // S9
    "Servo Variable Speed Fan: Unique Motor Beginner",      // S10
    "Temperature Sensor: Throne of PeeCee",                 // S11
    "Challenge Day",                                         // S12
  ],
  "2": [
    "Moving Robo Car Construction — Part 1",                // S1
    "Moving Robo Car Construction — Part 2",                // S2
    "Ultrasonic Sensor Integration in RoboCar and Programming", // S3
    "Gesture Sensor",                                        // S4
    "Robotic Claw Construction",                             // S5
    "Sound Activated Car",                                   // S6
    "Potentiometer, Servo Motor, Camera Pan System",         // S7
    "Proximity Sensor",                                      // S8
    "Traffic Light Sensor",                                  // S9
    "Home Automation System — Part 1",                       // S10
    "Home Automation System — Part 2",                       // S11
    "Challenge Day",                                          // S12
  ],
}),
"early electronics": withLevels({
  "1": [
    "Intro to Electronics",                    // S1
    "Electric Pathways",                       // S2
    "Combinational Circuits in Action",        // S3
    "Light Up the Numbers",                    // S4
    "Logic Starts Here",                       // S5
    "Logic Gets Smarter",                      // S6
    "Inside the Chip",                         // S7
    "Exploring IC",                            // S8
    "The Knob That Controls Electricity",      // S9
    "The Resistor That Sees Light",            // S10
    "Exploring LDR Projects",                  // S11
    "Charge and Discharge",                    // S12
    "Project Day 1",                           // S13
    "Project Day 2",                           // S14
    "Project Day 3",                           // S15
    "Challenge Day",                           // S16
  ],
  "2": [
    "Power of Transistor",                     // S1
    "NPN Transistor Circuits",                 // S2
    "Recording IC and Diode",                  // S3
    "Exploring Amplifier Circuits",            // S4
    "Silicon Controlled Rectifier",            // S5
    "More on SCR",                             // S6
    "Relay",                                   // S7
    "Transformer",                             // S8
    "FM Module",                               // S9
    "Variable Capacitor",                      // S10
    "Solar Cell",                              // S11
    "Gates with 7 Segment Display",            // S12
    "Combination of Transistor",               // S13
    "Electromagnetism",                        // S14
    "Project Day",                             // S15
    "Challenge Day",                           // S16
  ],
}),
 "drone": withLevels({
  "1": [
    "Discover the Drone World",           // S1
    "Anatomy of the Drone World",         // S2
    "Secrets of Flight",                  // S3
    "Let's Build — Part 1",               // S4
    "Let's Build — Part 2",               // S5
    "Mastering the Controls",             // S6
    "Ignition and Inspection",            // S7
    "Into the Skies",                     // S8
    "Pilot in Command",                   // S9
    "Aerial Fun Missions — Part 1",       // S10
    "Aerial Fun Missions — Part 2",       // S11
    "Challenge Day",                      // S12
  ],
  "2": [
    "Discover the Drone World",           // S1
    "Anatomy of the Drone World",         // S2
    "Secrets of Flight",                  // S3
    "Let's Build — Part 1",               // S4
    "Let's Build — Part 2",               // S5
    "Mastering the Controls",             // S6
    "Ignition and Inspection",            // S7
    "Into the Skies",                     // S8
    "Pilot in Command",                   // S9
    "Aerial Fun Missions — Part 1",       // S10
    "Aerial Fun Missions — Part 2",       // S11
    "Challenge Day",                      // S12
  ],
}),
  "coding with ai and pictoblox": withLevels({
    "1": [
      "PictoBlox interface setup",
      "Block coding recap",
      "AI extension overview",
      "Face detection activity",
      "Speech recognition project",
      "Sprite automation",
      "Mini AI game",
      "Level 1 demo",
    ],
    "2": [
      "Object detection activity",
      "AI decision making",
      "Chat style project",
      "Automation workflow",
      "Sensor and AI integration",
      "Capstone planning",
      "Final AI project",
      "Project presentation",
    ],
  }),
  "internet of things": withLevels({
    "1": [
      "IoT concept introduction",
      "Sensors and data",
      "Microcontroller connectivity",
      "Cloud dashboard basics",
      "Smart light project",
      "Data logging practice",
      "Automation rule setup",
      "Level 1 demo",
    ],
    "2": [
      "WiFi communication",
      "MQTT concept intro",
      "Remote monitoring project",
      "Alert notification logic",
      "Smart home prototype",
      "Testing data flow",
      "IoT mini project",
      "Project review",
    ],
    "3": [
      "Advanced sensors",
      "Data visualization",
      "Device control dashboard",
      "Security basics",
      "Automation workflow",
      "Capstone planning",
      "Final IoT solution",
      "Final presentation",
    ],
  }),
  "machine learning": withLevels({
    "1": [
      "ML concepts and examples",
      "Python for ML recap",
      "Data cleaning basics",
      "Train test split",
      "Linear regression activity",
      "Model accuracy check",
      "Prediction mini project",
      "Level 1 review",
    ],
    "2": [
      "Classification basics",
      "Decision tree activity",
      "Clustering intro",
      "Data visualization",
      "Text sentiment example",
      "Model comparison",
      "Mini ML project",
      "Level 2 demo",
    ],
    "3": [
      "Neural networks intro",
      "Image classification",
      "Time series concept",
      "Model deployment overview",
      "Ethics and bias",
      "Capstone planning",
      "Final model build",
      "Project presentation",
    ],
  }),
};

alias(courseTasks, "python", ["python programming", "python language"]);
alias(courseTasks, "java", ["java programming"]);
alias(courseTasks, "web designing", ["web design"]);
alias(courseTasks, "artificial intelligence", ["ai"]);
alias(courseTasks, "robotics ev3", ["ev3 robotics"]);
alias(courseTasks, "spike prime + python", [
  "spike prime python",
  "spike prime plus python",
]);
alias(courseTasks, "3d printing", ["printing3d", "3d printing course"]);
alias(courseTasks, "animation & coding", [
  "animation and coding",
  "animation coding",
]);
alias(courseTasks, "app designing", ["app design"]);
alias(courseTasks, "internet of things", ["iot"]);
alias(courseTasks, "coding with ai and pictoblox", [
  "coding ai pictoblox",
  "ai with pictoblox",
]);
alias(courseTasks, "drone", ["drone flying", "drone technology", "drone building"]);

export function getCourseTaskTemplates(
  courseName: string,
  level: string | null,
) {
  const normalizedCourseName = courseName.toLowerCase().trim();
  const normalizedLevel = String(level || "")
    .toLowerCase()
    .trim();

  return courseTasks[normalizedCourseName]?.[normalizedLevel] || [];
}
