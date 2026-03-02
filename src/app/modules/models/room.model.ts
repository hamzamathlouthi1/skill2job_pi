export interface Room {
  id: number;
  meetingLink: string;
  startAt: string;
  endAt: string;
  session?: {
    id: number;
    type: string;
    startAt: string;
    endAt: string;
  };
}
