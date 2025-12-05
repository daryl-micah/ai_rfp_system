import { db } from "@/db/drizzle";
import { rfps, vendors } from "@/db/schema";
import { sendRfpEmail } from "@/lib/emailClient";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  const { rfpId, vendorId } = await request.json();

  const rfp = (await db.select().from(rfps).where(eq(rfps.id, rfpId)))[0];
  const vendor = (
    await db.select().from(vendors).where(eq(vendors.id, vendorId))
  )[0];

  const html = `
    <h2>New RFP: ${rfp.title}</h2>
    <pre>${JSON.stringify(rfp.structured, null, 2)}</pre>`;

  await sendRfpEmail(vendor.email, `RFP: ${rfp.title}`, html);
}
