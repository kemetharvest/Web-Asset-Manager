export interface Student {
  seatNumber: number;
  arabicName: string;
  totalDegree: number;
  studentCaseDesc: string;
}

class StudentStore {
  private bySeating = new Map<number, Student>();
  private list: Student[] = [];

  load(students: Student[]): void {
    this.bySeating.clear();
    this.list = students;
    for (const s of students) {
      this.bySeating.set(s.seatNumber, s);
    }
  }

  clear(): void {
    this.bySeating.clear();
    this.list = [];
  }

  getBySeat(seatNumber: number): Student | undefined {
    return this.bySeating.get(seatNumber);
  }

  searchByName(
    query: string,
    page: number,
    limit: number
  ): { students: Student[]; total: number } {
    const q = query.trim().toLowerCase();
    const matches = this.list.filter((s) =>
      s.arabicName.toLowerCase().includes(q)
    );
    const total = matches.length;
    const start = (page - 1) * limit;
    const students = matches.slice(start, start + limit);
    return { students, total };
  }

  get count(): number {
    return this.list.length;
  }

  get loaded(): boolean {
    return this.list.length > 0;
  }

  getStats() {
    if (this.list.length === 0) {
      return {
        totalStudents: 0,
        averageScore: 0,
        highestScore: 0,
        lowestScore: 0,
        passedCount: 0,
        failedCount: 0,
        loaded: false,
      };
    }
    let sum = 0;
    let highest = -Infinity;
    let lowest = Infinity;
    let passedCount = 0;
    for (const s of this.list) {
      sum += s.totalDegree;
      if (s.totalDegree > highest) highest = s.totalDegree;
      if (s.totalDegree < lowest) lowest = s.totalDegree;
      if (s.studentCaseDesc.includes('ناجح')) passedCount++;
    }
    return {
      totalStudents: this.list.length,
      averageScore: Math.round((sum / this.list.length) * 100) / 100,
      highestScore: highest,
      lowestScore: lowest,
      passedCount,
      failedCount: this.list.length - passedCount,
      loaded: true,
    };
  }
}

// Global singleton — survives Next.js hot-reloads in dev and persists
// across requests within the same serverless function instance on Vercel.
declare global {
  // eslint-disable-next-line no-var
  var __studentStore: StudentStore | undefined;
}

export const store: StudentStore =
  global.__studentStore ?? (global.__studentStore = new StudentStore());
