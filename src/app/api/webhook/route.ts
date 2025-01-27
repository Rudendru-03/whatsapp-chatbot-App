import { NextResponse } from "next/server";
import { sendWhatsAppMessage } from "@/lib/whatsapp-api";

export async function POST(req: Request) {
  const body = await req.json();

  // Verify the webhook
  if (body.object === "whatsapp_business_account") {
    for (const entry of body.entry) {
      for (const change of entry.changes) {
        if (change.field === "messages") {
          for (const message of change.value.messages) {
            if (message.type === "text") {
              const phone = message.from;
              const text = message.text.body;

              // Process the message and generate a response
              const response = await processMessage(text);

              // Send the response back to the user
              await sendWhatsAppMessage(phone, response);
            }
          }
        }
      }
    }
    return NextResponse.json({ status: "ok" });
  }

  return NextResponse.json({ status: "error" }, { status: 400 });
}

async function processMessage(text: string): Promise<string> {
  // This is where you'd implement your chatbot logic
  // For now, we'll just echo the message back
  return `You said: ${text}`;
}

// Handle the GET request for webhook verification
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  // Replace 'YOUR_VERIFY_TOKEN' with your actual verify token
  if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new Response(challenge, { status: 200 });
  } else {
    return new Response("Verification failed", { status: 403 });
  }
}
