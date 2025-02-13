import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { numbers } = await req.json(); // Receive numbers array
    const accessToken = process.env.NEXT_PUBLIC_WHATSAPP_API_TOKEN; // Set this in .env file
    const phoneNumberId = process.env.NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER_ID;
    const messageBody = "Hello! This is a test message from broadcast service.";

    // Loop through numbers and send messages
    for (const number of numbers) {
      await fetch(`https://graph.facebook.com/v17.0/${phoneNumberId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: number,
          type: "text",
          text: { body: messageBody },
        }),
      });
    }

    return NextResponse.json({ message: "Messages sent successfully!" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to send messages" }, { status: 500 });
  }
}
