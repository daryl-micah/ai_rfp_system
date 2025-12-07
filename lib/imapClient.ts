import { ImapFlow } from "imapflow";

export async function getImapClient() {
  // Simple App Password method (recommended for development)
  const client = new ImapFlow({
    host: "imap.gmail.com",
    port: 993,
    secure: true,
    auth: {
      user: process.env.IMAP_USER!,
      pass: process.env.IMAP_PASS!, // Gmail App Password
    },
    logger: false,
  });
  return client;
  // Check if we should use OAuth2 or App Password
  // const useOAuth =
  //   process.env.GOOGLE_CLIENT_ID &&
  //   process.env.GOOGLE_CLIENT_SECRET &&
  //   process.env.GOOGLE_REFRESH_TOKEN;

  // if (useOAuth) {
  //   // OAuth2 method (more complex, requires Google Cloud setup)
  //   const { getAccessToken } = await import("./getAccessToken");
  //   const accessToken = await getAccessToken();

  //   const client = new ImapFlow({
  //     host: "imap.gmail.com",
  //     port: 993,
  //     secure: true,
  //     auth: {
  //       user: process.env.IMAP_USER!,
  //       accessToken,
  //       loginMethod: "XOAUTH2",
  //     },
  //     logger: false,
  //   });
  //   return client;
  // } else {
}
