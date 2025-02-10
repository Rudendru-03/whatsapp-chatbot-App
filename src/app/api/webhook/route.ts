import { NextRequest, NextResponse } from "next/server";

const VERIFY_TOKEN = "Omkar_Rahul";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const queryParams = new URL(req.url).searchParams;
  const mode = queryParams.get("hub.mode");
  const token = queryParams.get("hub.verify_token");
  const challenge = queryParams.get("hub.challenge");

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("Webhook Verified!");
    return new NextResponse(challenge || "", { status: 200 });
  }

  console.error("Webhook Verification Failed!");
  return new NextResponse("Forbidden", { status: 403 });
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();

    console.log("Webhook Event Received:", JSON.stringify(body, null, 2));

    if (body.object === "whatsapp_business_account") {
      const entry = body.entry;

      for (const e of entry) {
        const changes = e.changes;

        for (const change of changes) {
          // Handle incoming messages from users
          const messageData = change.value.messages?.[0];
          if (messageData) {
            const from = messageData.from;
            const messageId = messageData.id;
            const timestamp = new Date(parseInt(messageData.timestamp) * 1000);
            const messageType = messageData.type;

            // Log text messages
            if (messageType === "text") {
              const text = messageData.text?.body;
              console.log(`\n=== User Message Received ===`);
              console.log(`From: ${from}`);
              console.log(`Message ID: ${messageId}`);
              console.log(`Timestamp: ${timestamp}`);
              console.log(`Text: ${text}`);
            }
            // Add handling for other message types (image, video, etc.) here
          }

          // Handle message status updates (sent/delivered/read)
          const statusData = change.value.statuses?.[0];
          if (statusData) {
            const messageId = statusData.id;
            const status = statusData.status;
            const recipient = statusData.recipient_id;
            const timestamp = new Date(parseInt(statusData.timestamp) * 1000);
            const conversation = statusData.conversation?.id;
            const pricing = statusData.pricing?.billable
              ? `Cost: ${statusData.pricing.pricing_model}`
              : "";

            console.log(`\n=== Message Status Update ===`);
            console.log(`Message ID: ${messageId}`);
            console.log(`Status: ${status}`);
            console.log(`Recipient: ${recipient}`);
            console.log(`Timestamp: ${timestamp}`);
            console.log(`Conversation ID: ${conversation}`);
            console.log(`Pricing Model: ${pricing}`);
          }
        }
      }
    }

    return new NextResponse("Event Received", { status: 200 });
  } catch (error) {
    console.error("Error handling webhook event:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
