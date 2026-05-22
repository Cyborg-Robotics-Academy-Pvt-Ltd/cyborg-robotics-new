import { enhancedCourseData } from "@/data/enhancedCourseData";

export type WhatsAppCommunityInfo = {
  link: string;
  category: string;
  title: string;
  imageSrc: string;
  imageAlt: string;
};

const normalize = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9]+/g, "");

const WHATSAPP_LINKS: Record<string, string> = {
  Programming: "https://chat.whatsapp.com/REPLACE_PROGRAMMING",
  Robotics: "https://chat.whatsapp.com/REPLACE_ROBOTICS",
  Electronics: "https://chat.whatsapp.com/REPLACE_ELECTRONICS",
  "3D Printing": "https://chat.whatsapp.com/CaNL7KBldoWFQzS3kR6orX",
  "Drone Technology": "https://chat.whatsapp.com/REPLACE_DRONE",
  "Lego-Robotics": "https://chat.whatsapp.com/REPLACE_LEGOROBOTICS",
  "LEGO Robotics Workshop": "https://chat.whatsapp.com/REPLACE_LEGOROBOTICS",
  "3D Design Workshop": "https://chat.whatsapp.com/REPLACE_3DPRINTING",
  "Drone Workshop": "https://chat.whatsapp.com/REPLACE_DRONE",
  "PictoBlox Workshop": "https://chat.whatsapp.com/REPLACE_PICTOBLOX",
  "Google Sites Portfolio Workshop":
    "https://chat.whatsapp.com/Kez45HjoVuXBXFEZhREfXT",
  CodeFest: "https://chat.whatsapp.com/CaNL7KBldoWFQzS3kR6orX",
  Codefest: "https://chat.whatsapp.com/CaNL7KBldoWFQzS3kR6orX",
  "CodeFest Challenge": "https://chat.whatsapp.com/CaNL7KBldoWFQzS3kR6orX",
  "Maze Challenge": "https://chat.whatsapp.com/CaNL7KBldoWFQzS3kR6orX",
  "CodeFest 1.0 Maze Challenge": "https://chat.whatsapp.com/CaNL7KBldoWFQzS3kR6orX",
};

const WORKSHOP_COMMUNITY_LABELS: Record<string, string> = {
  legoroboticsworkshop: "Lego-Robotics Workshop",
  "3ddesignworkshop": "3D Design Workshop",
  droneworkshop: "Drone Workshop",
  pictobloxworkshop: "Pictoblox Workshop",
  googlesitesportfolioworkshop: "Google-Site Workshop",
  codefest: "CodeFest",
  codefestchallenge: "CodeFest",
  mazechallenge: "CodeFest",
  codefest10mazechallenge: "CodeFest",
};

const COMMUNITY_CARD_CONTENT: Record<
  string,
  { title: string; imageSrc: string; imageAlt: string }
> = {
  Programming: {
    title: "Programming Community",
    imageSrc: "/assets/online-course/python.avif",
    imageAlt: "Programming community",
  },
  Robotics: {
    title: "Robotics Community",
    imageSrc: "/assets/classroom-course/ev3.png",
    imageAlt: "Robotics community",
  },
  Electronics: {
    title: "Electronics Community",
    imageSrc: "/assets/classroom-course/arduino.webp",
    imageAlt: "Electronics community",
  },
  "3D Printing": {
    title: "3D Design Community",
    imageSrc: "/assets/classroom-course/3d-printing.png",
    imageAlt: "3D design community",
  },
  "Drone Technology": {
    title: "Drone Community",
    imageSrc: "/assets/classroom-course/Drone.png",
    imageAlt: "Drone community",
  },
  "Lego-Robotics": {
    title: "Lego-Robotics Community",
    imageSrc: "/assets/workshops/lego/image.png",
    imageAlt: "Lego robotics community",
  },
  "LEGO Robotics Workshop": {
    title: "Lego-Robotics Workshop Community",
    imageSrc: "/assets/workshops/lego/image.png",
    imageAlt: "LEGO Robotics workshop",
  },
  "3D Design Workshop": {
    title: "3D Design Workshop Community",
    imageSrc: "/assets/workshops/3d-printing/IMG_0327.jpeg",
    imageAlt: "3D design workshop",
  },
  "Drone Workshop": {
    title: "Drone Workshop Community",
    imageSrc: "/assets/workshops/drone/Drone_1.jpeg",
    imageAlt: "Drone workshop",
  },
  "PictoBlox Workshop": {
    title: "Pictoblox Workshop Community",
    imageSrc: "/assets/workshops/pictoblox/image1.png",
    imageAlt: "Pictoblox workshop",
  },
  "Google Sites Portfolio Workshop": {
    title: "Google-Site Workshop Community",
    imageSrc: "/assets/workshops/google-site/Google-Site.png",
    imageAlt: "Google Site workshop",
  },
  CodeFest: {
    title: "CodeFest Community",
    imageSrc: "/assets/codefest.png",
    imageAlt: "CodeFest community",
  },
  Codefest: {
    title: "CodeFest Community",
    imageSrc: "/assets/codefest.png",
    imageAlt: "CodeFest community",
  },
  "CodeFest Challenge": {
    title: "CodeFest Community",
    imageSrc: "/assets/codefest.png",
    imageAlt: "CodeFest community",
  },
  "Maze Challenge": {
    title: "CodeFest Community",
    imageSrc: "/assets/codefest.png",
    imageAlt: "CodeFest community",
  },
  "CodeFest 1.0 Maze Challenge": {
    title: "CodeFest Community",
    imageSrc: "/assets/codefest.png",
    imageAlt: "CodeFest community",
  },
};

export function getWhatsappCommunityInfo(
  courseName?: string | null
): WhatsAppCommunityInfo | null {
  const trimmedCourseName = courseName?.trim();

  if (trimmedCourseName) {
    const workshopLabel = WORKSHOP_COMMUNITY_LABELS[normalize(trimmedCourseName)];
    const directCommunityKey = workshopLabel || trimmedCourseName;
    const workshopLink =
      WHATSAPP_LINKS[trimmedCourseName] || WHATSAPP_LINKS[directCommunityKey];
    const workshopCard =
      COMMUNITY_CARD_CONTENT[trimmedCourseName] ||
      COMMUNITY_CARD_CONTENT[directCommunityKey];

    if (workshopLink && workshopLabel) {
      return {
        link: workshopLink,
        category: workshopLabel,
        title: workshopCard?.title || `${workshopLabel} Community`,
        imageSrc: workshopCard?.imageSrc || "/assets/classroom-course/ev3.png",
        imageAlt: workshopCard?.imageAlt || workshopLabel,
      };
    }
  }

  const normalizedCourseName = normalize(trimmedCourseName || "");
  const purchasedEntry = Object.entries(enhancedCourseData).find(([, course]) => {
    const title = normalize(course.title);
    return (
      title === normalizedCourseName ||
      normalizedCourseName.includes(title) ||
      title.includes(normalizedCourseName)
    );
  });

  const activeCategory = purchasedEntry?.[1]?.category;
  if (!activeCategory) return null;

  const link = WHATSAPP_LINKS[activeCategory];
  if (!link) return null;

  const card = COMMUNITY_CARD_CONTENT[activeCategory];
  return {
    link,
    category: activeCategory,
    title: card?.title || `${activeCategory} Community`,
    imageSrc: card?.imageSrc || "/assets/classroom-course/ev3.png",
    imageAlt: card?.imageAlt || activeCategory,
  };
}
