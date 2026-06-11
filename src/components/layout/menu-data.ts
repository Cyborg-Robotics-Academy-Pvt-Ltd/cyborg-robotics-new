import type { LucideIcon } from 'lucide-react';
import { BookOpen, Building2, Calendar, Camera, FileText, Phone, Users, Award, BookCopy, HandHelping, PersonStanding, Drama, Trophy, Sparkles, FolderKanban, Bot, Target, Tent, GraduationCap } from 'lucide-react';

export interface MenuItem {
  title: string;
  icon?: LucideIcon;
  href?: string;
  badge?: string;
  children?: MenuItem[];
  id?: string; // Added for tracking active sections
  mobileOnly?: boolean; // Flag to indicate if menu item should only show on mobile
}

const mainMenu: MenuItem[] = [
  {
    title: 'Robotics Diploma',
    icon: GraduationCap,
    href: '/robotics-diploma',
    mobileOnly: true,
  },
  {
    title: 'Codefest',
    icon: Trophy,
    href: '/codefest',
    badge: 'New',
    mobileOnly: true,
  },
  {
    title: 'Summer Camp',
    icon: Tent,
    href: '/summer-camp-2026',
    mobileOnly: true,
  },
   {
    title: 'Tech Programs',
    icon: Bot,
    mobileOnly: true,
    children: [
      { title: 'Lego Robotics', href: '/tech-programs/lego-robotics', icon: Target },
      { title: '3D Printing', href: '/tech-programs/3d-design-workshop', icon: Target },
      { title: 'Drone', href: '/tech-programs/drone', icon: Target },
      { title: 'Pictoblox', href: '/tech-programs/pictoblox', icon: Target },
      { title: 'Google Site', href: '/tech-programs/google-site', icon: Target },

    ],
  },
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
        title: 'Overview', 
        href: '/competition', 
        icon: Trophy,
        

      },
      { 
        title: 'Indian Robotics Olympiad (IRO) 2024', 
        href: '/competition/iro', 
        icon: Trophy,
        

      },
      { 
        title: 'World STEM & Robotics Olympiad', 
        href: '/competition/wsro', 
        icon: Trophy,
        

      },
      { 
        title: 'RoboTex India', 
        href: '/competition/robtex', 
        icon: Trophy,
        

      },
      { 
        title: 'FTC Competition', 
        href: '/competition/ftc-competition', 
        icon: Trophy,
        
      },
      {
        title: 'CodeFest Competition',
        href: '/codefest',
        icon: Trophy,
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
 
];


export const menuData = {
    mainMenu,
};
