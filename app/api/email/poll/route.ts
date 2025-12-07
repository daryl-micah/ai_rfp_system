import { db } from "@/db/drizzle";
import { proposals, vendors, rfps } from "@/db/schema";
import { getImapClient } from "@/lib/imapClient";
import { parseVendorEmail, generateProposalSummary } from "@/lib/llmClient";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  const client = await getImapClient();
  await client.connect();
  await client.mailboxOpen("INBOX");

  let processed = 0;

  for await (let msg of client.fetch("UNSEEN", { source: true })) {
    const from = msg?.envelope?.from?.[0]?.address;
    const body = msg?.source?.toString();

    if (!from || !body) continue;

    // Check if the vendor email exists in DB
    const vendor = await db
      .select()
      .from(vendors)
      .where(eq(vendors.email, from))
      .limit(1);

    if (!vendor || vendor.length === 0) {
      console.log("Ignoring email from non-vendor:", from);
      continue;
    }

    // Find the latest RFP (for now, until we track sent RFPs)
    const latestRfp = await db
      .select()
      .from(rfps)
      .orderBy(desc(rfps.createdAt))
      .limit(1);

    if (!latestRfp || latestRfp.length === 0) {
      console.warn("No active RFP found, skipping email");
      continue;
    }

    const rfpId = latestRfp[0].id;

    // Parse the email using LLM
    let parsed;
    let aiSummary;
    try {
      parsed = await parseVendorEmail(body);
      const summaryResult = await generateProposalSummary(parsed);
      aiSummary = summaryResult.summary;
    } catch (error) {
      console.error("LLM parsing failed:", error);
      continue;
    }

    // Save proposal with AI summary
    await db.insert(proposals).values({
      vendorId: vendor[0].id,
      rfpId,
      parsed,
      aiSummary,
      rawEmail: body,
    });

    processed++;
  }

  return Response.json({
    status: "ok",
    processed,
  });
}
