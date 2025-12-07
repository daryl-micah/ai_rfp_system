import { getImapClient } from "@/lib/imapClient";
import { db } from "@/db/drizzle";
import { vendors } from "@/db/schema";

export async function GET() {
  const diagnostics: any = {
    step: "",
    error: null,
    details: {},
  };

  try {
    // Step 1: Check environment variables
    diagnostics.step = "Checking environment variables";
    const hasOAuth = !!(
      process.env.GOOGLE_CLIENT_ID &&
      process.env.GOOGLE_CLIENT_SECRET &&
      process.env.GOOGLE_REFRESH_TOKEN
    );
    const hasAppPass = !!process.env.IMAP_PASS;

    diagnostics.details.envVars = {
      IMAP_USER: process.env.IMAP_USER ? "✓ Set" : "✗ Missing",
      authMethod: hasOAuth
        ? "OAuth2"
        : hasAppPass
        ? "App Password"
        : "✗ None configured",
      IMAP_PASS: hasAppPass ? "✓ Set" : "✗ Missing",
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID
        ? "✓ Set"
        : "- Not using OAuth2",
      GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET
        ? "✓ Set"
        : "- Not using OAuth2",
      GOOGLE_REFRESH_TOKEN: process.env.GOOGLE_REFRESH_TOKEN
        ? "✓ Set"
        : "- Not using OAuth2",
    };

    if (!hasOAuth && !hasAppPass) {
      throw new Error(
        "No IMAP authentication configured. Set either IMAP_PASS (recommended) or OAuth2 credentials."
      );
    }

    // Step 2: Try to connect to IMAP
    diagnostics.step = "Connecting to IMAP server";
    const client = await getImapClient();
    await client.connect();
    diagnostics.details.imapConnection = "✓ Connected successfully";

    // Step 3: Open mailbox
    diagnostics.step = "Opening INBOX";
    const mailbox = await client.mailboxOpen("INBOX");
    diagnostics.details.mailbox = {
      exists: mailbox.exists,
      path: mailbox.path,
      uidNext: mailbox.uidNext,
    };

    // Step 4: Check for unread emails
    diagnostics.step = "Checking for unread emails";
    let unseenCount = 0;
    const unseenEmails: any[] = [];

    try {
      for await (let msg of client.fetch("1:*", {
        envelope: true,
        flags: true,
        uid: true,
      })) {
        // Check if message is unseen
        if (!msg.flags?.has("\\Seen")) {
          unseenCount++;
          unseenEmails.push({
            uid: msg.uid,
            from: msg.envelope?.from?.[0]?.address,
            subject: msg.envelope?.subject,
            date: msg.envelope?.date,
          });

          if (unseenCount >= 5) break; // Limit to 5 for debugging
        }
      }
    } catch (fetchError: any) {
      diagnostics.details.fetchError = {
        message: fetchError.message,
        note: "Try enabling IMAP in Gmail settings: https://mail.google.com/mail/u/0/#settings/fwdandpop",
      };
    }

    diagnostics.details.unseenEmails = {
      count: unseenCount,
      emails: unseenEmails,
    };

    // Step 5: Check vendors in database
    diagnostics.step = "Checking vendors in database";
    const allVendors = await db.select().from(vendors);
    diagnostics.details.vendors = allVendors.map((v) => ({
      id: v.id,
      name: v.name,
      email: v.email,
    }));

    // Step 6: Match emails to vendors
    diagnostics.step = "Matching emails to vendors";
    const matches: any[] = [];
    for (const email of unseenEmails) {
      const vendorMatch = allVendors.find((v) => v.email === email.from);
      matches.push({
        email: email.from,
        matched: !!vendorMatch,
        vendorId: vendorMatch?.id,
        vendorName: vendorMatch?.name,
      });
    }
    diagnostics.details.emailVendorMatches = matches;

    await client.logout();

    diagnostics.step = "Complete";
    diagnostics.status = "success";

    return Response.json(diagnostics, { status: 200 });
  } catch (error: any) {
    diagnostics.error = {
      message: error.message,
      stack: error.stack,
      code: error.code,
    };

    return Response.json(diagnostics, { status: 500 });
  }
}
