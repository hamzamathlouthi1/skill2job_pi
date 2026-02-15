export type SessionType = 'ONLINE' | 'ONSITE';

export interface Session {
  id: number;
  type: SessionType;
  startAt: string;
  endAt: string;
  capacity: number;
}
