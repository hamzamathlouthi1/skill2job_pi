export interface JobOffer {
  id?: number;
  partnerId: number;
  title: string;
  description: string;
  location?: string;
  type: string;   // INTERNSHIP | JOB
  mode: string;   // ONSITE | REMOTE | HYBRID
  requirements?: string;
  deadline?: string; // yyyy-MM-dd
  status?: string;   // OPEN | CLOSED
}
