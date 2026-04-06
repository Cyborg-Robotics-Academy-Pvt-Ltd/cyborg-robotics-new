import type {
  AgeGroup,
  CampLocation,
  Course,
  FAQItem,
  RegistrationField,
  RegistrationFormData,
  WhyItem,
} from "./types";

export const AGE_GROUPS: AgeGroup[] = ["4+", "7+", "10+"];

export const DEFAULT_REGISTRATION_FORM_DATA: RegistrationFormData = {
  childName: "",
  age: "",
  contactNumber: "",
};

export const REGISTRATION_FIELDS: RegistrationField[] = [
  {
    id: "childName",
    label: "Name of the Child *",
    type: "text",
    placeholder: "Enter child's full name",
    span: 2,
  },
  {
    id: "age",
    label: "Age *",
    type: "number",
    placeholder: "4-16",
    span: 1,
  },
  {
    id: "contactNumber",
    label: "Contact Number *",
    type: "tel",
    placeholder: "Enter contact number",
    span: 1,
  },
];

export const LOCATIONS: CampLocation[] = [
  {
    id: "magarpatta",
    name: "Magarpatta",
    emoji: "🏙️",
    days: "Every Tuesday",
    totalHours: "36 Hrs",
    packageDates: "20 Apr - 31 May",
    slides: [
      { emoji: "⚙️", label: "Gear Works", sublabel: "Wk 1-2" },
      {
        emoji: "🚁",
        label: "Drone Craft",
        sublabel: "Wk 3-4 · Drone Included",
      },
      { emoji: "💡", label: "Founders Club", sublabel: "Wk 5-6" },
      { emoji: "🏆", label: "Certificate", sublabel: "36 Hrs Total" },
    ],
    schedule: [
      {
        week: "Week 1",
        dates: "20-26 Apr",
        course: "Gear Works",
        tag: "Mechanical Robotics",
        icon: "⚙️",
        prices: { "4+": 3500, "7+": 3500, "10+": 4500 },
      },
      {
        week: "Week 2",
        dates: "27 Apr-3 May",
        course: "Gear Works",
        tag: "Mechanical Robotics",
        icon: "🔩",
        prices: { "4+": 3500, "7+": 3500, "10+": 4500 },
      },
      {
        week: "Week 3-4",
        dates: "4-17 May",
        course: "Drone Craft",
        tag: "Take Away Drone 🚁",
        icon: "🚁",
        prices: { "4+": 12000, "7+": 12000, "10+": 12000 },
      },
      {
        week: "Week 5-6",
        dates: "18-31 May",
        course: "Founders Club",
        tag: "Entrepreneurship",
        icon: "💡",
        prices: { "4+": 9000, "7+": 9000, "10+": 9000 },
      },
    ],
    fullPackage: {
      prices: { "4+": 28000, "7+": 28000, "10+": 30000 },
      earlyBird: { "4+": 24999, "7+": 24999, "10+": 26999 },
    },
  },
  {
    id: "kalyani",
    name: "Kalyani Nagar",
    emoji: "🌿",
    days: "Mon · Wed · Thu · Fri",
    totalHours: "36 Hrs",
    packageDates: "20 Apr - 29 May",
    slides: [
      {
        emoji: "🚁",
        label: "Drone Craft",
        sublabel: "Wk 1-2 · Drone Included",
      },
      { emoji: "💡", label: "Founders Club", sublabel: "Wk 3-4" },
      { emoji: "⚙️", label: "Gear Works", sublabel: "Wk 5-6" },
      { emoji: "🏆", label: "Certificate", sublabel: "36 Hrs Total" },
    ],
    schedule: [
      {
        week: "Week 1-2",
        dates: "20 Apr-1 May",
        course: "Drone Craft",
        tag: "Take Away Drone 🚁",
        icon: "🚁",
        prices: { "4+": 12000, "7+": 12000, "10+": 12000 },
      },
      {
        week: "Week 3-4",
        dates: "4-15 May",
        course: "Founders Club",
        tag: "Entrepreneurship",
        icon: "💡",
        prices: { "4+": 9000, "7+": 9000, "10+": 9000 },
      },
      {
        week: "Week 5",
        dates: "18-22 May",
        course: "Gear Works",
        tag: "Mechanical Robotics",
        icon: "⚙️",
        prices: { "4+": 3500, "7+": 3500, "10+": 4500 },
      },
      {
        week: "Week 6",
        dates: "25-29 May",
        course: "Gear Works",
        tag: "Mechanical Robotics",
        icon: "🔩",
        prices: { "4+": 3500, "7+": 3500, "10+": 4500 },
      },
    ],
    fullPackage: {
      prices: { "4+": 28000, "7+": 28000, "10+": 30000 },
      earlyBird: { "4+": 24999, "7+": 24999, "10+": 26999 },
    },
  },
  {
    id: "kharadi",
    name: "Kharadi",
    emoji: "🚀",
    days: "Every Tuesday",
    totalHours: "24 Hrs",
    packageDates: "4 May - 31 May",
    slides: [
      { emoji: "⚙️", label: "Gear Works", sublabel: "Wk 1-2" },
      {
        emoji: "🚁",
        label: "Drone Craft",
        sublabel: "Wk 3-4 · Drone Included",
      },
      { emoji: "🏆", label: "Certificate", sublabel: "24 Hrs Total" },
    ],
    schedule: [
      {
        week: "Week 1",
        dates: "4-10 May",
        course: "Gear Works",
        tag: "Mechanical Robotics",
        icon: "⚙️",
        prices: { "4+": 3500, "7+": 3500, "10+": 4500 },
      },
      {
        week: "Week 2",
        dates: "11-17 May",
        course: "Gear Works",
        tag: "Mechanical Robotics",
        icon: "🔩",
        prices: { "4+": 3500, "7+": 3500, "10+": 4500 },
      },
      {
        week: "Week 3-4",
        dates: "18-31 May",
        course: "Drone Craft",
        tag: "Take Away Drone 🚁",
        icon: "🚁",
        prices: { "4+": 12000, "7+": 12000, "10+": 12000 },
      },
    ],
    fullPackage: {
      prices: { "4+": 19000, "7+": 19000, "10+": 21000 },
      earlyBird: { "4+": 16999, "7+": 16999, "10+": 18999 },
    },
  },
];

export const COURSES: Course[] = [
  {
    id: "gear",
    icon: "⚙️",
    name: "Gear Works",
    subtitle: "Mechanical Robotics",
    color: "#8D0F11",
    bg: "rgba(141,15,17,0.06)",
    border: "rgba(141,15,17,0.15)",
    description:
      "Students build working mechanical robots using gears, motors, and structures - learning motion, power transfer, and engineering fundamentals through hands-on construction.",
    outcomes: [
      "Build 3+ robot models",
      "Understand gear ratios",
      "Learn motor mechanics",
      "Engineering problem solving",
    ],
    image: "/assets/summer-camp/gear-works.jpg",
    duration: "1-1.5 Hr/session",
    ageGroup: "Age 4+",
  },
  {
    id: "drone",
    icon: "🚁",
    name: "Drone Craft",
    subtitle: "Aeronautics & Flight",
    color: "#1a6b8a",
    bg: "rgba(26,107,138,0.06)",
    border: "rgba(26,107,138,0.15)",
    description:
      "Kids assemble a real drone kit, learn aerodynamics and flight principles, and practice guided drone flying under expert supervision. Drone kit goes home with each student.",
    outcomes: [
      "Assemble a real drone",
      "Learn aerodynamics",
      "Practice guided flight",
      "Take drone home 🎁",
    ],
    image: "/assets/summer-camp/drone-craft.jpg",
    duration: "1-1.5 Hr/session",
    ageGroup: "Age 4+",
    highlight: true,
  },
  {
    id: "founders",
    icon: "💡",
    name: "Founders Club",
    subtitle: "Innovation & Entrepreneurship",
    color: "#7b4f12",
    bg: "rgba(123,79,18,0.06)",
    border: "rgba(123,79,18,0.15)",
    description:
      "Students identify real-world problems, design solutions, and pitch their startup ideas - building entrepreneurial thinking through design thinking workshops.",
    outcomes: [
      "Identify real problems",
      "Design solutions",
      "Build a prototype concept",
      "Pitch to the class",
    ],
    image: "/assets/summer-camp/founders-club.jpg",
    duration: "1-1.5 Hr/session",
    ageGroup: "Age 4+",
  },
];

export const WHY_ITEMS: WhyItem[] = [
  {
    icon: "🤖",
    title: "Real Hardware",
    desc: "Kids work with actual robots, drones and electronic components - not simulations.",
  },
  {
    icon: "👨‍🏫",
    title: "Expert Trainers",
    desc: "Experienced STEM educators guiding every session with structured, age-appropriate curriculum.",
  },
  {
    icon: "🏆",
    title: "Certified Learning",
    desc: "Every student receives a certificate of completion from Cyborg Robotics Academy.",
  },
  {
    icon: "🚁",
    title: "Drone Take-Home",
    desc: "Each child assembles and keeps their own drone kit after Drone Craft sessions.",
  },
  {
    icon: "🧩",
    title: "Project-Based",
    desc: "Every session ends with a working project - no passive listening, only active building.",
  },
  {
    icon: "👥",
    title: "Small Batches",
    desc: "Limited seats per batch ensures every child gets individual attention from trainers.",
  },
];

export const FAQS: FAQItem[] = [
  {
    q: "What age group is this camp for?",
    a: "The camp is designed for kids aged 4 and above, split into three age groups: 4+, 7+, and 10+. Each group gets age-appropriate curriculum and difficulty levels.",
  },
  {
    q: "Is the drone included in the fee?",
    a: "Yes! The Drone Craft module includes a take-home drone kit. Each student assembles their drone during sessions and takes it home at the end.",
  },
  {
    q: "Can I register for individual weeks instead of the full package?",
    a: "Absolutely. You can register for individual weeks (Gear Works, Drone Craft, or Founders Club) separately. The full package gives you the best value with early bird pricing.",
  },
  {
    q: "What is the early bird offer?",
    a: "The early bird offer gives you a significant discount on the full package. For example, Magarpatta full package (Age 7+) is ₹28,000 but early bird is ₹24,999. Limited seats - register early.",
  },
  {
    q: "Are sessions online or offline?",
    a: "All sessions are fully offline at the respective camp location (Magarpatta, Kalyani Nagar, or Kharadi). Hands-on learning requires physical presence.",
  },
  {
    q: "What happens if a session is missed?",
    a: "Please contact the Cyborg team on WhatsApp for makeup session options. We do our best to accommodate based on batch availability.",
  },
];
