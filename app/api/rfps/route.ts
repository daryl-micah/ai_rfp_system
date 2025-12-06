import { db } from "@/db/drizzle";
import { rfps } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  try {
    const data = await db.select().from(rfps).orderBy(desc(rfps.createdAt));
    return Response.json(data);
  } catch (error) {
    return Response.json({ error: "Failed to fetch RFPs" }, { status: 500 });
  }
}
