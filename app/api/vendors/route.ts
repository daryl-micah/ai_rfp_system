// app/api/vendors/route.ts
import { NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { vendors } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  try {
    const allVendors = await db
      .select()
      .from(vendors)
      .orderBy(desc(vendors.createdAt));

    return NextResponse.json(allVendors);
  } catch (err) {
    console.error("GET /api/vendors error", err);
    return new NextResponse("Failed to fetch vendors", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, contact } = body;

    if (!email) {
      return new NextResponse("Email is required", { status: 400 });
    }

    const [inserted] = await db
      .insert(vendors)
      .values({
        name: name || null,
        email,
        contact: contact || null,
      })
      .returning();

    return NextResponse.json(inserted, { status: 201 });
  } catch (err) {
    console.error("POST /api/vendors error", err);
    return new NextResponse("Failed to create vendor", { status: 500 });
  }
}
