import type { LucideIcon } from 'lucide-react';
import { BookOpen, Building2, Calendar, Camera, FileText, Phone, Users, Award, BookCopy, HandHelping, PersonStanding, Drama, Trophy, Sparkles, FolderKanban, Bot, Target, Tent } from 'lucide-react';

export interface MenuItem {
  title: string;
  icon?: LucideIcon;
  href?: string;
  children?: MenuItem[];
  id?: string; // Added for tracking active sections
}

const mainMenu: MenuItem[] = [
  {
   title: 'Courses',
    icon: BookOpen,
    children: [
      { title: 'MindMap', href: '/course-mindmap', icon: BookCopy },
      { title: 'Robotics', href: '/all-courses#Robotics', icon: Bot, id: 'Robotics' },
      { title: 'Skill Based', href: '/all-courses#skillbased', icon: Target },
    
    
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
        href: '/competition/ftc-competition', 
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
        { title: 'Student Certificate', href: '/gallery/behind-scene?tab=certificates', icon: Award, id: 'certificates' },
        { title: 'Student Action', href: '/gallery/behind-scene?tab=actions', icon: FolderKanban, id: 'actions' },
        { title: 'Student in (Competition) Glory', href: '/gallery/behind-scene?tab=competitions', icon: Trophy, id: 'competitions' },
    ],
  },
  {
    title: 'Blogs',
    icon: FileText,
    href: '#',
  },
  {
    title: 'Contact Us',
    icon: Phone,
    href: '/contact-us',
  },
  {
    title: 'Tech Programs',
    icon: Bot,
    children: [
      { title: 'Lego Robotics', href: '/tech-programs/lego-robotics', icon: Target },
      { title: '3D Printing', href: '#', icon: Target },
    ],
  },
];


export const menuData = {
    mainMenu,
};