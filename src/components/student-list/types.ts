export interface Task {
  course: string;
  dateTime: string;
  status: string;
  task: string;
}

export interface Course {
  name?: string;
  completed?: boolean;
  status?: string;
  classNumber?: string;
  level?: string;
  startDate?: string;
  trainerId?: string;
  trainerName?: string;
}

export interface Student {
  id: string;
  PrnNumber: string;
  username: string;
  completedTasks: number;
  ongoingTasks: number;
  tasks: Task[];
  courses: Course[];
  classes?: string;
  createdAt?: string | null;
  createdBy?: string;
  createdByRole?: string;
  lastLogin?: string | null;
  role?: string;
  nextCourse?: string;
  trainerId?: string;
  trainerName?: string;
  status?: string;
}

export interface Trainer {
  id: string;
  name?: string;
  email?: string;
  username?: string;
}
