import { ImapFlow } from "imapflow";
import { getAccessToken } from "./getAccessToken";

export async function getImapClient() {
  const accessToken = await getAccessToken();

  const client = new ImapFlow({
    host: "imap.gmail.com",
    port: 993,
    secure: true,
    auth: {
      user: process.env.IMAP_USER!, // your Gmail
      accessToken, // OAuth2 token
      loginMethod: "XOAUTH2",
    },
  });

  await client.connect();
  return client;
}
