import path from 'path';
import fs from 'fs';
import * as XLSX from 'xlsx';
import { store, type Student } from './store';

const COLUMN_MAP: Record<string, keyof Student> = {
  seating_no: 'seatNumber',
  seat_number: 'seatNumber',
  seatnumber: 'seatNumber',
  // eslint-disable-next-line @typescript-eslint/naming-convention
  'رقم_الجلوس': 'seatNumber',
  'رقم الجلوس': 'seatNumber',
  arabic_name: 'arabicName',
  name: 'arabicName',
  student_name: 'arabicName',
  studentname: 'arabicName',
  'الاسم': 'arabicName',
  'اسم_الطالب': 'arabicName',
  'اسم الطالب': 'arabicName',
  total_degree: 'totalDegree',
  total: 'totalDegree',
  totaldegree: 'totalDegree',
  'المجموع': 'totalDegree',
  'المجموع الكلي': 'totalDegree',
  student_case_desc: 'studentCaseDesc',
  case: 'studentCaseDesc',
  status: 'studentCaseDesc',
  'الحالة': 'studentCaseDesc',
  'النتيجة': 'studentCaseDesc',
};

function normalizeKey(key: string): string {
  return key.trim().toLowerCase().replace(/\s+/g, '_');
}

export function parseExcelBuffer(buffer: Buffer): Student[] {
  const wb = XLSX.read(buffer, { type: 'buffer' });
  const sheetName = wb.SheetNames[0];
  const ws = wb.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws);
  if (rows.length === 0) return [];

  const firstRow = rows[0];
  const fieldMap = new Map<string, keyof Student>();
  for (const key of Object.keys(firstRow)) {
    const normalized = normalizeKey(key);
    const mapped = COLUMN_MAP[key] ?? COLUMN_MAP[normalized];
    if (mapped) fieldMap.set(key, mapped);
  }

  const students: Student[] = [];
  for (const row of rows) {
    const student: Partial<Student> = {};
    for (const [col, field] of fieldMap.entries()) {
      const val = row[col];
      if (field === 'seatNumber' || field === 'totalDegree') {
        const n = Number(val);
        if (!isNaN(n)) (student as Record<string, unknown>)[field] = n;
      } else {
        if (val != null) (student as Record<string, unknown>)[field] = String(val);
      }
    }
    if (
      student.seatNumber != null &&
      student.arabicName != null &&
      student.totalDegree != null &&
      student.studentCaseDesc != null
    ) {
      students.push(student as Student);
    }
  }
  return students;
}

// Deduplicates concurrent preload calls — all waiters share a single promise.
declare global {
  // eslint-disable-next-line no-var
  var __preloadPromise: Promise<void> | undefined;
}

async function loadFromDisk(): Promise<void> {
  const cwd = process.cwd();
  const candidates = [
    // egypt-results/data/ — bundled for Vercel (and local dev after copy)
    path.resolve(cwd, 'data', 'students.xlsx'),
    // Replit monorepo layout: attached_assets at workspace root
    path.resolve(cwd, '../../attached_assets', 'يرو500_1785289189627.xlsx'),
    path.resolve(cwd, 'attached_assets', 'يرو500_1785289189627.xlsx'),
    path.resolve('/home/runner/workspace/attached_assets', 'يرو500_1785289189627.xlsx'),
  ];

  for (const filePath of candidates) {
    if (fs.existsSync(filePath)) {
      try {
        console.log(`[preload] Loading students from ${filePath}`);
        const buffer = fs.readFileSync(filePath);
        const students = parseExcelBuffer(buffer);
        if (students.length > 0) {
          store.load(students);
          console.log(`[preload] Loaded ${students.length} students`);
          return;
        }
      } catch (err) {
        console.error(`[preload] Failed to load from ${filePath}:`, err);
      }
    }
  }

  console.log('[preload] No Excel file found; data store is empty until admin uploads a file');
}

export async function ensureStoreLoaded(): Promise<void> {
  if (store.loaded) return;

  global.__preloadPromise ??= loadFromDisk();
  await global.__preloadPromise;
}
