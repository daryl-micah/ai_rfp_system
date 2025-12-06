import { db } from "@/db/drizzle";
import { rfps } from "@/db/schema";
import { structureRFP } from "@/lib/llmClient";

export async function POST(request: Request) {
  const { text } = await request.json();
  const res = await structureRFP(text);

  const structured = await db
    .insert(rfps)
    .values({
      title: res.title ?? "AI Generated RFP",
      description: text,
      structured: res,
    })
    .returning();

  return Response.json(structured[0]);
}
