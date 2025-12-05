import { google } from "googleapis";

export async function getAccessToken() {
  const oauth2Client = new google.auth.OAuth2(
    process.env.IMAP_CLIENT_ID!,
    process.env.IMAP_CLIENT_SECRET!,
    "http://localhost:3000/oauth2callback" // must match google cloud console
  );

  oauth2Client.setCredentials({
    refresh_token: process.env.IMAP_REFRESH_TOKEN!,
  });

  const { token } = await oauth2Client.getAccessToken();
  return token!;
}
