export const FRAME_STATES = [
  "not-found", "page-failed", "student-failed", "environment-failed", "entry-failed",
  "login-ended", "login-continue", "login-refused", "login-unavailable", "in-flight", "region-failing", "global-error",
] as const;
export type FrameState = (typeof FRAME_STATES)[number];
