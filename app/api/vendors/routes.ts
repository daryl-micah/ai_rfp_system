import { db } from "@/db/drizzle";
import { vendors } from "@/db/schema";

export async function GET() {
  const list = await db.select().from(vendors);
  return Response.json(list);
}

export async function POST(request: Request) {
  const body = await request.json();
  const result = await db.insert(vendors).values(body).returning();
  return Response.json(result[0]);
}
