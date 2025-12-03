import { parseVendorEmail } from "@/lib/llmClient";

export async function POST(request: Request) {
  const { email } = await request.json();
  const parsed = await parseVendorEmail(email);
  return Response.json(parsed);
}
