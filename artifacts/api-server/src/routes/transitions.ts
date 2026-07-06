import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { transitionsTable, insertTransitionSchema } from "@workspace/db/schema";
import { CreateTransitionBodySchema, ListTransitionsResponse } from "@workspace/api-zod";
import { desc } from "drizzle-orm";

const router: IRouter = Router();

router.get("/transitions", async (_req, res) => {
  const rows = await db
    .select()
    .from(transitionsTable)
    .orderBy(desc(transitionsTable.createdAt));
  const data = ListTransitionsResponse.parse(rows);
  res.json(data);
});

router.post("/transitions", async (req, res) => {
  const body = CreateTransitionBodySchema.parse(req.body);
  const validated = insertTransitionSchema.parse(body);
  const [row] = await db.insert(transitionsTable).values(validated).returning();
  res.status(201).json(row);
});

export default router;
