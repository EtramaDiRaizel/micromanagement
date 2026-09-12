export type StatusType =
  | 'hit_me_up'
  | 'available'
  | 'not_available'
  | 'in_the_mood'
  | 'fancy_a_fag';

export interface StatusConfig {
  id: StatusType;
  label: string;
  emoji: string;
  color: string;        // Tailwind bg class
  textColor: string;    // Tailwind text class
  priority: boolean;    // true only for hit_me_up
}

export interface UserStatus {
  userId: string;
  username: string;
  displayName: string;
  currentStatus: StatusType;
  statusUpdatedAt: string; // ISO timestamp
}

export interface StatusUpdateRequest {
  status: StatusType;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
