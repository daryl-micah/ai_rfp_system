import { db } from "@/db/drizzle";
import { rfps } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET({ params }: { params: { id: string } }) {
  const rfpId = Number(params.id);

  const rfp = await db.select().from(rfps).where(eq(rfps.id, rfpId)).limit(1);

  if (!rfp.length) {
    return Response.json({ error: "RFP not found" }, { status: 404 });
  }

  return Response.json(rfp[0]);
}
