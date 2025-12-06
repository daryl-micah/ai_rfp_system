import { db } from "@/db/drizzle";
import { rfps, proposals, vendors } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const rfpId = Number(id);

  const rfp = await db.select().from(rfps).where(eq(rfps.id, rfpId)).limit(1);

  const proposalData = await db
    .select({
      proposal: proposals,
      vendor: vendors,
    })
    .from(proposals)
    .leftJoin(vendors, eq(proposals.vendorId, vendors.id))
    .where(eq(proposals.rfpId, rfpId));

  return Response.json({
    rfp: rfp[0],
    proposals: proposalData,
  });
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const rfpId = Number(id);
  await db.delete(rfps).where(eq(rfps.id, rfpId));
  return new Response(null, { status: 204 });
}
