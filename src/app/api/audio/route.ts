import { NextResponse } from "next/server";
import { sendWhatsAppAudio } from "@/lib/whatsapp-api";

export async function POST(req: Request) {
  const { phoneNumber, content } = await req.json();

  try {
    await sendWhatsAppAudio(phoneNumber, content);
    return NextResponse.json({ success: true });
  } catch (_error) {
    return NextResponse.json(
      { _error: "Failed to send audio" },
      { status: 500 }
    );
  }
}
