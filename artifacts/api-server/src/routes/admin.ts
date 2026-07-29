import { Router, type IRouter } from "express";
import multer from "multer";
import * as XLSX from "xlsx";
import { store, type Student } from "../lib/store";
import { validatePassword, createToken, validateToken, extractToken } from "../lib/auth";
import { logger } from "../lib/logger";
import { AdminLoginBody } from "@workspace/api-zod";

const router: IRouter = Router();

// Multer: store file in memory
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 200 * 1024 * 1024 }, // 200MB max
  fileFilter: (_req, file, cb) => {
    if (
      file.mimetype === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      file.mimetype === "application/vnd.ms-excel" ||
      file.originalname.endsWith(".xlsx") ||
      file.originalname.endsWith(".xls")
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only .xlsx and .xls files are allowed"));
    }
  },
});

// Column name mapping — intelligent detection of common variants
const COLUMN_MAP: Record<string, keyof Student> = {
  seating_no: "seatNumber",
  seat_number: "seatNumber",
  seatnumber: "seatNumber",
  رقم_الجلوس: "seatNumber",
  "رقم الجلوس": "seatNumber",
  arabic_name: "arabicName",
  name: "arabicName",
  student_name: "arabicName",
  studentname: "arabicName",
  الاسم: "arabicName",
  اسم_الطالب: "arabicName",
  "اسم الطالب": "arabicName",
  total_degree: "totalDegree",
  total: "totalDegree",
  totaldegree: "totalDegree",
  المجموع: "totalDegree",
  "المجموع الكلي": "totalDegree",
  student_case_desc: "studentCaseDesc",
  case: "studentCaseDesc",
  status: "studentCaseDesc",
  الحالة: "studentCaseDesc",
  النتيجة: "studentCaseDesc",
};

function normalizeKey(key: string): string {
  return key.trim().toLowerCase().replace(/\s+/g, "_");
}

function parseExcel(buffer: Buffer): Student[] {
  const wb = XLSX.read(buffer, { type: "buffer" });
  const sheetName = wb.SheetNames[0];
  const ws = wb.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws);

  if (rows.length === 0) return [];

  // Build column mapping from actual headers
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

// GET /admin/status — public endpoint
router.get("/admin/status", async (_req, res): Promise<void> => {
  res.json({ loaded: store.loaded, count: store.count });
});

// POST /admin/login
router.post("/admin/login", async (req, res): Promise<void> => {
  const parsed = AdminLoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  if (!validatePassword(parsed.data.password)) {
    res.status(401).json({ error: "كلمة المرور غير صحيحة" });
    return;
  }

  const token = createToken();
  res.json({ token });
});

// POST /admin/upload — multipart/form-data, requires auth
router.post("/admin/upload", upload.single("file"), async (req, res): Promise<void> => {
  const token = extractToken(req.headers.authorization);
  if (!validateToken(token)) {
    res.status(401).json({ error: "غير مصرح لك بهذا الإجراء" });
    return;
  }

  if (!req.file) {
    res.status(400).json({ error: "لم يتم رفع أي ملف" });
    return;
  }

  try {
    const students = parseExcel(req.file.buffer);
    if (students.length === 0) {
      res.status(400).json({ error: "لم يتم العثور على بيانات صحيحة في الملف" });
      return;
    }

    store.load(students);
    req.log.info({ count: students.length }, "Loaded students into memory");
    res.json({ count: students.length, message: `تم رفع بيانات ${students.length.toLocaleString("ar-EG")} طالب بنجاح` });
  } catch (err) {
    req.log.error({ err }, "Failed to parse Excel");
    res.status(400).json({ error: "فشل في قراءة الملف. تأكد من أنه ملف Excel صحيح" });
  }
});

// DELETE /admin/data — requires auth
router.delete("/admin/data", async (req, res): Promise<void> => {
  const token = extractToken(req.headers.authorization);
  if (!validateToken(token)) {
    res.status(401).json({ error: "غير مصرح لك بهذا الإجراء" });
    return;
  }

  store.clear();
  req.log.info("Cleared all student data");
  res.json({ message: "تم حذف جميع البيانات بنجاح" });
});

// GET /admin/stats — requires auth
router.get("/admin/stats", async (req, res): Promise<void> => {
  const token = extractToken(req.headers.authorization);
  if (!validateToken(token)) {
    res.status(401).json({ error: "غير مصرح لك بهذا الإجراء" });
    return;
  }

  res.json(store.getStats());
});

export default router;
