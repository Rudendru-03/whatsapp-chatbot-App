<<<<<<< HEAD
import { type NextRequest, NextResponse } from "next/server";
import { messageStore } from "../../../lib/messageStore";
import { sendEventToAll } from "../../api/messages/route";
=======
import { NextRequest, NextResponse } from "next/server";
import { MediaType, WhatsAppMessage, messageStorage } from "@/lib/types";
>>>>>>> 6f318411ff415a8959c0f95ab471b3606230cd59

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;

<<<<<<< HEAD
export interface Message {
  content: string;
  isSent: boolean;
  timestamp: string;
  status: "received" | "sent";
  from: string;
  to: string;
  mediaType: string;
  mediaUrl: string;
}

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("Webhook verified");
    return new NextResponse(challenge, { status: 200 });
  } else {
    return new NextResponse("Forbidden", { status: 403 });
  }
}

=======
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

>>>>>>> 6f318411ff415a8959c0f95ab471b3606230cd59
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (body.object === "whatsapp_business_account") {
      for (const entry of body.entry) {
        for (const change of entry.changes) {
<<<<<<< HEAD
          if (change.field === "messages") {
            for (const message of change.value.messages) {
              const from = message.from;
              const timestamp = new Date(
                Number.parseInt(message.timestamp) * 1000
              ).toISOString();

              let content = "";
              let mediaType = "";
              let mediaUrl = "";

              switch (message.type) {
                case "text":
                  content = message.text.body;
                  break;
                case "image":
                case "audio":
                case "video":
                case "document":
                  mediaType = message.type;
                  mediaUrl = message[message.type].id; // You'll need to fetch the actual URL
                  content = message[message.type].caption || "";
                  break;
                default:
                  console.log(`Unsupported message type: ${message.type}`);
                  continue;
              }

              const newMessage: Message = {
                content,
                isSent: false,
                timestamp,
                status: "received",
                from,
                to: change.value.metadata.display_phone_number,
                mediaType,
                mediaUrl,
              };

              messageStore.addMessage(newMessage);
              sendEventToAll({ type: "newMessage", message: newMessage });
            }
=======
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
>>>>>>> 6f318411ff415a8959c0f95ab471b3606230cd59
          }
        }
      }
    }

<<<<<<< HEAD
    return new NextResponse("OK", { status: 200 });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
=======
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
>>>>>>> 6f318411ff415a8959c0f95ab471b3606230cd59
  }
}
