import { db } from "@/db/drizzle";
import { compareProposals } from "@/lib/llmClient";
import { eq } from "drizzle-orm";

export async function GET(_: Request, { params }: any) {
  const rows = await db.query.proposals.findMany({
    where: (p) => eq(p.rfpId, Number(params.id)),
  });

  const recommended = await compareProposals(rows);

  return Response.json(recommended);
}
