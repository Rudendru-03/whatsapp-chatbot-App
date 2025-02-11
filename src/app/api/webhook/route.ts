import { NextRequest, NextResponse } from "next/server";
import { MediaType, WhatsAppMessage, messageStorage } from "@/lib/types";

const VERIFY_TOKEN = "Omkar_Rahul";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return new NextResponse(challenge);
  }
  return new NextResponse("Verification failed", { status: 403 });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (body.object === "whatsapp_business_account") {
      for (const entry of body.entry) {
        for (const change of entry.changes) {
          const value = change.value;
          
          // Handle incoming messages
          if (value.messages?.[0]) {
            const msg = value.messages[0];
            const newMessage: WhatsAppMessage = {
              id: msg.id,
              content: msg.text?.body || "[Media Message]",
              from: msg.from,
              timestamp: new Date(parseInt(msg.timestamp) * 1000),
              isSent: false,
              status: 'delivered',
              media: msg.type !== 'text' ? {
                id: msg[msg.type].id,
                type: msg.type as MediaType,
                caption: msg[msg.type]?.caption
              } : undefined
            };
            messageStorage.add(newMessage);
          }

          // Handle status updates
          if (value.statuses?.[0]) {
            const { id, status } = value.statuses[0];
            messageStorage.update(id, {
              status: status === 'read' ? 'read' :
                      status === 'delivered' ? 'delivered' :
                      status === 'sent' ? 'sent' : 'failed'
            });
          }
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}