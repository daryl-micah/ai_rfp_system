import nodemailer from "nodemailer";

export const mailer = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendRfpEmail(to: string, subject: string, html: string) {
  return await mailer.sendMail({
    from: process.env.SMTP_USER,
    to,
    subject,
    html,
  });
}
