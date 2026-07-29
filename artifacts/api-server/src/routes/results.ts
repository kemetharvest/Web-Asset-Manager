import { Router, type IRouter } from "express";
import { store } from "../lib/store";
import {
  GetResultBySeatParams,
  SearchByNameQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

// GET /results/search — must come BEFORE /:seatNumber to avoid param clash
router.get("/results/search", async (req, res): Promise<void> => {
  const parsed = SearchByNameQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { name, page = 1, limit = 20 } = parsed.data;
  if (!name || name.trim().length === 0) {
    res.status(400).json({ error: "name query parameter is required" });
    return;
  }

  const safePage = Math.max(1, Math.floor(Number(page)));
  const safeLimit = Math.min(100, Math.max(1, Math.floor(Number(limit))));

  const { students, total } = store.searchByName(name, safePage, safeLimit);

  res.json({
    students,
    total,
    page: safePage,
    limit: safeLimit,
  });
});

// GET /results/:seatNumber
router.get("/results/:seatNumber", async (req, res): Promise<void> => {
  const parsed = GetResultBySeatParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid seat number" });
    return;
  }

  const student = store.getBySeat(parsed.data.seatNumber);
  if (!student) {
    res.status(404).json({ error: "لم يتم العثور على نتيجة لهذا الرقم" });
    return;
  }

  res.json(student);
});

export default router;
