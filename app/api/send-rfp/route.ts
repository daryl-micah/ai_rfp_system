import { db } from "@/db/drizzle";
import { rfps, vendors } from "@/db/schema";
import { sendRfpEmail } from "@/lib/emailClient";
import { eq, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { rfpId, vendorIds } = await request.json();

    if (!rfpId || !vendorIds || vendorIds.length === 0) {
      return NextResponse.json(
        { error: "rfpId and vendorIds are required" },
        { status: 400 }
      );
    }

    // Fetch RFP
    const rfpData = await db.select().from(rfps).where(eq(rfps.id, rfpId));
    if (rfpData.length === 0) {
      return NextResponse.json({ error: "RFP not found" }, { status: 404 });
    }
    const rfp = rfpData[0];

    // Fetch vendors
    const vendorList = await db
      .select()
      .from(vendors)
      .where(inArray(vendors.id, vendorIds));

    if (vendorList.length === 0) {
      return NextResponse.json({ error: "No vendors found" }, { status: 404 });
    }

    // Send emails to all vendors
    const sentTo: string[] = [];
    const errors: string[] = [];

    for (const vendor of vendorList) {
      try {
        const html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">New Request for Proposal: ${rfp.title}</h2>
            <p>Dear ${vendor.name || "Vendor"},</p>
            <p>We are requesting proposals for the following procurement:</p>
            <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <pre style="white-space: pre-wrap; font-size: 13px;">${JSON.stringify(
                rfp.structured,
                null,
                2
              )}</pre>
            </div>
            <p>Please reply to this email with your proposal including pricing, delivery timeline, and terms.</p>
            <p><strong>RFP ID:</strong> ${rfp.id}</p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
            <p style="color: #666; font-size: 12px;">This is an automated email from the RFP Management System.</p>
          </div>
        `;

        await sendRfpEmail(vendor.email, `RFP: ${rfp.title}`, html);
        sentTo.push(vendor.name || vendor.email);
      } catch (err) {
        console.error(`Failed to send to ${vendor.email}:`, err);
        errors.push(vendor.email);
      }
    }

    return NextResponse.json({
      success: true,
      sentTo,
      errors,
      total: vendorList.length,
    });
  } catch (error) {
    console.error("Error in /api/send-rfp:", error);
    return NextResponse.json(
      { error: "Failed to send RFP emails" },
      { status: 500 }
    );
  }
}
