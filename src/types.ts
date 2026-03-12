import { Timestamp } from 'firebase/firestore';

export type UserRole = 'admin' | 'voter';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  createdAt: Timestamp;
}

export interface ElectionOption {
  id: string;
  labels: Record<string, string>;
  voteCount: number;
}

export interface Position {
  id: string;
  titles: Record<string, string>;
  candidates: ElectionOption[];
}

export type ElectionStatus = 'upcoming' | 'active' | 'closed';

export interface Election {
  id: string;
  titles: Record<string, string>;
  descriptions: Record<string, string>;
  status: ElectionStatus;
  startDate: Timestamp;
  endDate: Timestamp;
  positions: Position[];
  createdAt: Timestamp;
}

export interface Vote {
  id: string;
  voterUid: string;
  electionId: string;
  optionId: string;
  timestamp: Timestamp;
}
