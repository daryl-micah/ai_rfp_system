import { structureRFP } from "@/lib/llmClient";

export async function POST(request: Request) {
  const { text } = await request.json();
  const json = await structureRFP(text);
  return Response.json(json);
}
