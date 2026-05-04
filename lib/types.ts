export type GoalCategory = 'spiritual' | 'business' | 'body';
export type DayOfWeek = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
export type Priority = 'high' | 'medium' | 'low';
export type MetricType = 'checkbox' | 'number' | 'duration';

export interface SubGoal {
  id: string;
  pillar: GoalCategory;
  title: string;
  metricType: MetricType;
  targetValue?: number;
  unit?: string;
}

export interface Goal {
  id: string;
  category: GoalCategory;
  title: string;
  description: string;
  weeklyHoursTarget: number;
  subGoals: SubGoal[];
}

export interface Task {
  id: string;
  goalCategory: GoalCategory;
  title: string;
  completed: boolean;
  scheduledDate?: string;
  scheduledTime?: string;
  duration?: number;
  priority: Priority;
  recurring?: 'daily' | 'weekly' | DayOfWeek[];
}

export interface TimeBlock {
  id: string;
  day: DayOfWeek;
  startTime: string;
  endTime: string;
  goalCategory: GoalCategory | 'personal';
  title: string;
  taskIds: string[];
}

export interface DailyScore {
  date: string;
  scores: Record<GoalCategory, number>;
  notes?: string;
}

export interface WeekTemplate {
  id: string;
  name: string;
  timeBlocks: TimeBlock[];
}

export interface AppData {
  goals: Goal[];
  tasks: Task[];
  weekTemplates: WeekTemplate[];
  currentSchedule: TimeBlock[];
  dailyScores: DailyScore[];
}
