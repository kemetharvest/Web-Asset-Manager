export interface Student {
  seatNumber: number;
  arabicName: string;
  totalDegree: number;
  studentCaseDesc: string;
}

export interface StudentSearchResult {
  students: Student[];
  total: number;
  page: number;
  limit: number;
}

export interface AdminStats {
  totalStudents: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  passedCount: number;
  failedCount: number;
  loaded: boolean;
}

export interface DataStatus {
  loaded: boolean;
  count: number;
}

export interface AdminToken {
  token: string;
}
