import type { LucideIcon } from 'lucide-react';
import { BookOpen, Building2, Calendar, Camera, FileText, Phone, Users, Award, BookCopy, HandHelping, PersonStanding, Drama, Trophy, Sparkles, FolderKanban, Bot, Target, Tent } from 'lucide-react';

export interface MenuItem {
  title: string;
  icon?: LucideIcon;
  href?: string;
  children?: MenuItem[];
  id?: string; // Added for tracking active sections
}

const offlineCourseChildren: MenuItem[] = [
    { title: 'Age 5–7', href: '/courses/bambino-coding' },
    { title: 'Age 7–10', href: '/courses/animation-coding' },
    { title: 'Age 10–12', href: '/courses/robotics-ev3' },
];

const competitionChildren: MenuItem[] = [
    { title: 'Regional', href: '#' },
    { title: 'National', href: '#' },
    { title: 'International', href: '#' },
];

const mainMenu: MenuItem[] = [
  {
   title: 'Courses',
    icon: BookOpen,
    children: [
      { title: 'MindMap', href: '/course-mindmap', icon: BookCopy },
      { title: 'Robotics', href: '/all-courses#Robotics', icon: Bot, id: 'Robotics' },
      { title: 'Skill Based', href: '/all-courses#skillbased', icon: Target },
      { title: 'Workshop & Camps', href: '/all-courses#workshopscamps', icon: Tent },
    
      // { title: 'Offline Course', href: '/courses', icon: PersonStanding, children: offlineCourseChildren },
      // { title: 'Soft Skills', href: '#', icon: HandHelping },
    ],
  },
  {
    title: 'About Us',
    icon: Building2,
  href: '/about-us',
    children: [
  { title: 'Brand Stories', href: '/about-us#story', icon: Sparkles, id: 'story' },
  { title: 'Meet the Team', href: '/about-us#team', icon: Users, id: 'team' },
  { title: 'Meet the Founder', href: '/about-us#founders', icon: PersonStanding, id: 'founders' },
  { title: 'Awards', href: '/about-us#awards', icon: Award, id: 'awards' },
      { title: 'Careers', href: '/careers', icon: HandHelping, id: 'careers' },
    ],
  },
  {
    title: 'Event Stories',
    icon: Calendar,
    children: [
        { title: 'Workshop', href: '#', icon: Drama },
        { title: 'Competition (categorized)', href: '#', icon: Trophy, children: competitionChildren },
        { title: 'Team Huddle', href: '#', icon: Users },
        { title: 'Celebrations', href: '#', icon: Sparkles },
    ],
  },
  {
    title: 'Competitions',
    icon: Trophy,
    children: [
      { 
        title: 'FTC Competition', 
        href: '/ftc-competition', 
        icon: Trophy,
        // Adding a highlight for the latest competition
        id: 'latest-competition'
      },
      // Add other competitions here as needed
    ],
  },
  {
    title: 'Behind Scenes',
    icon: Camera,
    children: [
        { title: 'Student Certificate', href: '#', icon: Award },
        { title: 'Student Action', href: '#', icon: FolderKanban },
        { title: 'Student in (Competition) Glory', href: '#', icon: Trophy },
    ],
  },
  {
    title: 'Blogs + Newsletter',
    icon: FileText,
    href: '/blogs',
  },
  {
    title: 'Contact Us',
    icon: Phone,
    href: '/contact-us',
  },
];


export const menuData = {
    mainMenu,
};