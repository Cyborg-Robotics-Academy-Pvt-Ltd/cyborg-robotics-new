import type { LucideIcon } from 'lucide-react';
import { BookOpen, Building2, Calendar, Camera, FileText, Phone, Users, Award, BookCopy, HandHelping, PersonStanding, Drama, Trophy, Sparkles, FolderKanban } from 'lucide-react';

export interface MenuItem {
  title: string;
  icon?: LucideIcon;
  href?: string;
  children?: MenuItem[];
}

const offlineCourseChildren: MenuItem[] = [
    { title: 'Age 5–7', href: '/classroom-courses/bambino-coding' },
    { title: 'Age 7–10', href: '/classroom-courses/animation-coding' },
    { title: 'Age 10–12', href: '/classroom-courses/robotics-ev3' },
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
      { title: 'Online Course', href: '/online-courses', icon: BookCopy },
      { title: 'Offline Course', href: '/classroom-courses', icon: PersonStanding, children: offlineCourseChildren },
      { title: 'Soft Skills', href: '#', icon: HandHelping },
    ],
  },
  {
    title: 'About Us',
    icon: Building2,
  href: '/about-us',
    children: [
  { title: 'Brand Stories', href: '/about-us#story', icon: Sparkles },
  { title: 'Meet the Team', href: '/about-us#team', icon: Users },
  { title: 'Meet the Founder', href: '/about-us#founders', icon: PersonStanding },
      { title: 'Join Us', href: '', icon: HandHelping },
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