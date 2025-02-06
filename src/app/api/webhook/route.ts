import type { NextRequest } from "next/server";
import axios from "axios";

const { NEXT_PUBLIC_WHATSAPP_API_TOKEN, WHATSAPP_VERIFY_TOKEN } = process.env;

/**
 * Handle incoming WhatsApp messages and status updates.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("📩 Incoming Webhook Data:", JSON.stringify(body, null, 2));

    const changes = body.entry?.[0]?.changes?.[0]?.value;

    // 🔹 Check if it's a message
    if (changes?.messages) {
      const message = changes.messages[0];
      const sender = message.from;
      const text = message.text?.body || "[Non-text message]";
      const timestamp = message.timestamp;
      const messageId = message.id;

      console.log(`📥 Received Message:`);
      console.log(`   🆔 ID: ${messageId}`);
      console.log(`   👤 From: ${sender}`);
      console.log(
        `   🕒 Timestamp: ${new Date(timestamp * 1000).toLocaleString()}`
      );
      console.log(`   💬 Message: ${text}`);

      // 🔹 Extract business phone number ID
      const businessPhoneNumberId = changes.metadata?.phone_number_id;
      if (!businessPhoneNumberId) {
        console.error("❌ Missing phone number ID");
        return new Response(
          JSON.stringify({ error: "Missing phone number ID" }),
          { status: 400 }
        );
      }

      // 🔹 Reply to the user
      const replyText = `Echo: ${text}`;
      await axios.post(
        `https://graph.facebook.com/v18.0/${businessPhoneNumberId}/messages`,
        {
          messaging_product: "whatsapp",
          to: sender,
          text: { body: replyText },
          context: { message_id: messageId },
        },
        {
          headers: {
            Authorization: `Bearer ${NEXT_PUBLIC_WHATSAPP_API_TOKEN}`,
          },
        }
      );

      console.log(`📤 Sent Reply:`);
      console.log(`   🆔 To: ${sender}`);
      console.log(`   💬 Message: ${replyText}`);

      // 🔹 Mark the message as read
      await axios.post(
        `https://graph.facebook.com/v18.0/${businessPhoneNumberId}/messages`,
        {
          messaging_product: "whatsapp",
          status: "read",
          message_id: messageId,
        },
        {
          headers: {
            Authorization: `Bearer ${NEXT_PUBLIC_WHATSAPP_API_TOKEN}`,
          },
        }
      );

      console.log(`✅ Marked as Read: ${messageId}`);
      return new Response("Message processed", { status: 200 });
    }

    // 🔹 Check if it's a message status update
    if (changes?.statuses) {
      const statusUpdate = changes.statuses[0];
      const statusMessageId = statusUpdate.id;
      const recipient = statusUpdate.recipient_id;
      const status = statusUpdate.status;
      const timestamp = statusUpdate.timestamp;

      console.log(`📡 Message Status Update:`);
      console.log(`   🆔 ID: ${statusMessageId}`);
      console.log(`   👤 Recipient: ${recipient}`);
      console.log(
        `   🕒 Timestamp: ${new Date(timestamp * 1000).toLocaleString()}`
      );
      console.log(`   📌 Status: ${status.toUpperCase()}`);

      return new Response("Status update processed", { status: 200 });
    }

    console.log("⚠️ No relevant data found in webhook event.");
    return new Response("No action taken", { status: 200 });
  } catch (error: any) {
    console.error(
      "❌ Error processing message:",
      error.response?.data || error.message
    );
    return new Response("Error processing message", { status: 500 });
  }
}

/**
 * Webhook verification for WhatsApp API
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  console.log("🔍 Webhook Verification Request:");
  console.log(`   Mode: ${mode}`);
  console.log(`   Token: ${token}`);

  if (mode === "subscribe" && token === WHATSAPP_VERIFY_TOKEN) {
    console.log("✅ Webhook verified successfully!");
    return new Response(challenge, { status: 200 });
  }

  console.error("❌ Webhook verification failed.");
  return new Response("Forbidden", { status: 403 });
}
