import Groq from "groq-sdk";

export const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
});

// helper for JSON response
export async function runGroq(prompt: string) {
  const res = await groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content: "Respond ONLY with valid JSON. No explanations.",
      },
      { role: "user", content: prompt },
    ],
    model: "llama-3.1-8b-instant",
    temperature: 0.1,
  });

  const text = res.choices[0].message.content || "";
  return JSON.parse(text);
}

// structure RFP
export async function structureRFP(RfpText: string) {
  return await runGroq(`Convert the following procurement request into structured JSON:

    {
      "title": string,
      "items": [{"name": string, "qty": number, "specs": string}],
      "budget": number,
      "delivery_timeline": string,
      "payment_terms": string,
      "notes": string
    }

    Text: ${RfpText}`);
}

// parse vendor email
export async function parseVendorEmail(email: string) {
  return await runGroq(`Extract vendor proposal information and return valid JSON:
    {
      "price": number,
      "delivery_days": number,
      "warranty": string,
      "terms": string,
      "notes": string
    }
      
    Email: ${email}`);
}

// generate AI summary for a proposal
export async function generateProposalSummary(proposalData: any) {
  return await runGroq(`Summarize this vendor proposal in 1-2 sentences highlighting key points (price, delivery, warranty):
    
    ${JSON.stringify(proposalData, null, 2)}
    
    Return JSON: { "summary": "..." }`);
}

// compare proposals
export async function compareProposals(proposals: any[]) {
  return await runGroq(`
    Given these vendor proposals:

    ${JSON.stringify(proposals, null, 2)}

    Recommend the best vendor based on:
    - price
    - delivery speed
    - warranty
    - commercial terms
    - clarity and risk

    Return JSON:
    {
      "winner": number,
      "explanation": string
    }`);
}
