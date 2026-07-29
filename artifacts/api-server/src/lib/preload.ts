/**
 * Pre-load the uploaded Excel file from attached_assets on startup.
 * This runs once at startup so that the data is immediately available.
 */
import path from "path";
import fs from "fs";
import * as XLSX from "xlsx";
import { store, type Student } from "./store";
import { logger } from "./logger";

const COLUMN_MAP: Record<string, keyof Student> = {
  seating_no: "seatNumber",
  seat_number: "seatNumber",
  seatnumber: "seatNumber",
  arabic_name: "arabicName",
  name: "arabicName",
  student_name: "arabicName",
  total_degree: "totalDegree",
  total: "totalDegree",
  student_case_desc: "studentCaseDesc",
  case: "studentCaseDesc",
  status: "studentCaseDesc",
};

function normalizeKey(key: string): string {
  return key.trim().toLowerCase().replace(/\s+/g, "_");
}

function parseExcelBuffer(buffer: Buffer): Student[] {
  const wb = XLSX.read(buffer, { type: "buffer" });
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
      if (field === "seatNumber" || field === "totalDegree") {
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

export async function preloadExcelData(): Promise<void> {
  // Look for Excel files in attached_assets relative to workspace root
  const candidates = [
    path.resolve(process.cwd(), "attached_assets", "يرو500_1785289189627.xlsx"),
    path.resolve(process.cwd(), "../../attached_assets", "يرو500_1785289189627.xlsx"),
    path.resolve("/home/runner/workspace/attached_assets", "يرو500_1785289189627.xlsx"),
  ];

  for (const filePath of candidates) {
    if (fs.existsSync(filePath)) {
      try {
        logger.info({ filePath }, "Pre-loading Excel file");
        const buffer = fs.readFileSync(filePath);
        const students = parseExcelBuffer(buffer);
        if (students.length > 0) {
          store.load(students);
          logger.info({ count: students.length }, "Pre-loaded student data from Excel file");
          return;
        }
      } catch (err) {
        logger.error({ err, filePath }, "Failed to pre-load Excel file");
      }
    }
  }

  logger.info("No pre-load Excel file found; data store is empty until admin uploads a file");
}
