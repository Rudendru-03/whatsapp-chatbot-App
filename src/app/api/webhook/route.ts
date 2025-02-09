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

    if (body.object === "whatsapp_business_account") {
      for (const entry of body.entry) {
        for (const change of entry.changes) {
          // Handle incoming messages
          const messageData = change.value.messages?.[0];
          if (messageData?.type === 'text') {
            const messagePayload = {
              content: messageData.text.body,
              isSent: false,
              timestamp: new Date(parseInt(messageData.timestamp) * 1000),
              status: 'delivered' as const,
              from: messageData.from,
              to: messageData.to
            };

            await fetch(`${process.env.NEXTAUTH_URL}/api/messages`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(messagePayload)
            });
          }

          // Handle message status updates
          const statusData = change.value.statuses?.[0];
          if (statusData) {
            await fetch(`${process.env.NEXTAUTH_URL}/api/messages`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                messageId: statusData.id,
                status: statusData.status,
                timestamp: new Date(parseInt(statusData.timestamp) * 1000)
              })
            });
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