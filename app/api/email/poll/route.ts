import { db } from "@/db/drizzle";
import { proposals, vendors, rfps } from "@/db/schema";
import { getImapClient } from "@/lib/imapClient";
import { parseVendorEmail, generateProposalSummary } from "@/lib/llmClient";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  let client;
  try {
    console.log("Starting email poll...");
    client = await getImapClient();

    console.log("Connecting to IMAP server...");
    await client.connect();
    console.log("IMAP client connected");

    const mailbox = await client.mailboxOpen("INBOX");
    console.log(`Mailbox opened. Total emails: ${mailbox.exists}`);

    let processed = 0;
    const errors: string[] = [];

    // Search for unseen messages first
    const unseenUids = await client.search({ seen: false });
    const uidArray = Array.isArray(unseenUids) ? unseenUids : [];
    console.log(`Found ${uidArray.length} unseen emails`);

    if (uidArray.length === 0) {
      await client.logout();
      return Response.json({
        status: "ok",
        processed: 0,
        message: "No unread emails found",
      });
    }

    // Fetch the unseen messages
    for await (let msg of client.fetch(uidArray, {
      envelope: true,
      source: true,
    })) {
      const from = msg?.envelope?.from?.[0]?.address;
      const body = msg?.source?.toString();

      console.log(`Processing email from: ${from}`);

      if (!from || !body) {
        console.warn("Email missing from address or body");
        continue;
      }

      // Check if the vendor email exists in DB
      const vendor = await db
        .select()
        .from(vendors)
        .where(eq(vendors.email, from))
        .limit(1);

      if (!vendor || vendor.length === 0) {
        console.log(`Ignoring email from non-vendor: ${from}`);
        errors.push(`Email from non-vendor: ${from}`);
        continue;
      }

      console.log(`✓ Vendor matched: ${vendor[0].name || vendor[0].email}`);

      // Find the latest RFP (for now, until we track sent RFPs)
      const latestRfp = await db
        .select()
        .from(rfps)
        .orderBy(desc(rfps.createdAt))
        .limit(1);

      if (!latestRfp || latestRfp.length === 0) {
        console.warn("No active RFP found, skipping email");
        errors.push("No active RFP found");
        continue;
      }

      const rfpId = latestRfp[0].id;
      console.log(`Using RFP: ${latestRfp[0].title} (ID: ${rfpId})`);

      // Parse the email using LLM
      let parsed;
      let aiSummary;
      try {
        console.log("Parsing email with AI...");
        parsed = await parseVendorEmail(body);
        console.log("Parsed data:", JSON.stringify(parsed, null, 2));

        console.log("Generating AI summary...");
        const summaryResult = await generateProposalSummary(parsed);
        aiSummary = summaryResult.summary;
        console.log("AI summary:", aiSummary);
      } catch (error: any) {
        console.error("LLM parsing failed:", error.message);
        errors.push(`LLM parsing failed for ${from}: ${error.message}`);
        continue;
      }

      // Save proposal with AI summary
      try {
        await db.insert(proposals).values({
          vendorId: vendor[0].id,
          rfpId,
          parsed,
          aiSummary,
          rawEmail: body,
        });
        console.log(`✓ Proposal saved for vendor ${vendor[0].name}`);
        processed++;
      } catch (error: any) {
        console.error("Database insert failed:", error.message);
        errors.push(`DB insert failed: ${error.message}`);
      }
    }

    await client.logout();
    console.log(`Email poll complete. Processed: ${processed}`);

    return Response.json({
      status: "ok",
      processed,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    console.error("Email poll error:", error);
    if (client) {
      try {
        await client.logout();
      } catch (e) {
        // Ignore logout errors
      }
    }
    return Response.json(
      {
        status: "error",
        error: error.message,
        stack: error.stack,
      },
      { status: 500 }
    );
  }
}
