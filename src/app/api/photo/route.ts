import { NextResponse } from "next/server";
import { sendWhatsAppImage } from "@/lib/whatsapp-api";

export async function POST(req: Request) {
  const { phoneNumber, content } = await req.json();

  try {
    await sendWhatsAppImage(phoneNumber, content);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to send image" },
      { status: 500 }
    );
  }
}
