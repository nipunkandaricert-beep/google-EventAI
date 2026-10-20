export type EventType = "wedding" | "birthday" | "community";

export type EventStyle =
  | "elegant"
  | "casual"
  | "rustic"
  | "modern"
  | "traditional"
  | "outdoor";

export type VendorStatus = "needed" | "contacted" | "quoted" | "booked" | "paid";
export type TaskStatus = "pending" | "in-progress" | "completed";

export interface EventDetails {
  id: string;
  type: EventType;
  name: string;
  date: string;
  location: string;
  guestCount: number;
  totalBudget: number;
  style: EventStyle;
  culture?: string;
  dietaryNeeds?: string[];
  constraints?: string;
  description?: string;
}

export interface BudgetItem {
  id: string;
  category: string;
  allocated: number;
  spent: number;
  percentage: number;
  notes?: string;
}

export interface TimelineItem {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  phase: string;
  completed: boolean;
}

export interface VendorItem {
  id: string;
  category: string;
  name: string;
  contact?: string;
  quote?: number;
  status: VendorStatus;
}

export interface IdeaItem {
  id: string;
  category: "theme" | "menu" | "activity" | "decor" | "entertainment" | "other";
  content: string;
  saved: boolean;
}

export interface TaskItem {
  id: string;
  title: string;
  dueDate: string;
  status: TaskStatus;
  phase: string;
  priority: "low" | "medium" | "high";
}

export interface EventPlan {
  event: EventDetails;
  budget: BudgetItem[];
  timeline: TimelineItem[];
  vendors: VendorItem[];
  ideas: IdeaItem[];
  tasks: TaskItem[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}
