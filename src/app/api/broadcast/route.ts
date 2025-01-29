import { NextResponse } from "next/server";
import { sendWhatsAppMessage } from "@/lib/whatsapp-api";

export async function POST(req: Request) {
  const { message, recipients } = await req.json();

  if (!message || !recipients || !Array.isArray(recipients)) {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }

  try {
    const results = await Promise.all(
      recipients.map((recipient) => sendWhatsAppMessage(recipient, message))
    );

    return NextResponse.json({ status: "success", results });
  } catch (_error) {
    console.error("Error broadcasting message:", _error);
    return NextResponse.json(
      { error: "Failed to broadcast message" },
      { status: 500 }
    );
  }
}
