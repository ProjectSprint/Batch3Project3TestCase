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
