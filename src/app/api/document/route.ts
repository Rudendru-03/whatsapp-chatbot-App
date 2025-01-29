import { NextResponse } from "next/server";
import { sendWhatsAppDocument } from "@/lib/whatsapp-api";

export async function POST(req: Request) {
  const { phoneNumber, content } = await req.json();

  try {
    await sendWhatsAppDocument(phoneNumber, content);
    return NextResponse.json({ success: true });
  } catch (_error) {
    return NextResponse.json(
      { error: "Failed to send document" },
      { status: 500 }
    );
  }
}
