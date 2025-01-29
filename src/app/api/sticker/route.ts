import { NextResponse } from "next/server";
import { sendWhatsAppSticker } from "@/lib/whatsapp-api";

export async function POST(req: Request) {
  const { phoneNumber, content } = await req.json();

  try {
    await sendWhatsAppSticker(phoneNumber, content);
    return NextResponse.json({ success: true });
  } catch (_error) {
    return NextResponse.json(
      { _error: "Failed to send sticker" },
      { status: 500 }
    );
  }
}
