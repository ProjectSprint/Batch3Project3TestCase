export const enum ActivityType {
  Walking = "Walking",
  Yoga = "Yoga",
  Stretching = "Stretching",
  Cycling = "Cycling",
  Swimming = "Swimming",
  Dancing = "Dancing",
  Hiking = "Hiking",
  Running = "Running",
  HIIT = "HIIT",
  JumpRope = "JumpRope",
}

export type ActivityTypeValue = keyof typeof ActivityType;

export const CALORIES_PER_MINUTE: Record<ActivityTypeValue, number> = {
  [ActivityType.Walking]: 4,
  [ActivityType.Yoga]: 4,
  [ActivityType.Stretching]: 4,
  [ActivityType.Cycling]: 8,
  [ActivityType.Swimming]: 8,
  [ActivityType.Dancing]: 8,
  [ActivityType.Hiking]: 10,
  [ActivityType.Running]: 10,
  [ActivityType.HIIT]: 10,
  [ActivityType.JumpRope]: 10,
};

export interface User {
  _id?: string;
  email: string;
  password: string;
  preference: string | null;
  weightUnit: string | null;
  heightUnit: string | null;
  weight: number | null;
  height: number | null;
  name: string | null;
  imageUri: string | null;
  createdAt: string;
}

export interface Activity {
  _id: string;
  userId: string;
  activityType: ActivityTypeValue;
  doneAt: string; // ISO Date
  durationInMinutes: number;
  caloriesBurned: number;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityFilters {
  activityType?: ActivityTypeValue;
  doneAtFrom?: string;
  doneAtTo?: string;
  caloriesBurnedMin?: number;
  caloriesBurnedMax?: number;
}
