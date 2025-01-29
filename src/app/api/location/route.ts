import { NextResponse } from "next/server";
import { sendWhatsAppLocation } from "@/lib/whatsapp-api";

export async function POST(req: Request) {
  const { phoneNumber, content } = await req.json();
  const [latitude, longitude] = content.split(",");

  try {
    await sendWhatsAppLocation(
      phoneNumber,
      Number.parseFloat(latitude),
      Number.parseFloat(longitude)
    );
    return NextResponse.json({ success: true });
  } catch (_error) {
    return NextResponse.json(
      { error: "Failed to send location" },
      { status: 500 }
    );
  }
}
