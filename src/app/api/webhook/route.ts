import { type NextRequest, NextResponse } from "next/server";
import { messageStore } from "../../../lib/messageStore";
import { sendEventToAll } from "../../api/messages/route";

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;

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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (body.object === "whatsapp_business_account") {
      for (const entry of body.entry) {
        for (const change of entry.changes) {
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
          }
        }
      }
    }

    return new NextResponse("OK", { status: 200 });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
