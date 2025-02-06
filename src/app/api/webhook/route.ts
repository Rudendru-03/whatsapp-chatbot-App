import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

// Define expected environment variables
const { WHATSAPP_VERIFY_TOKEN, NEXT_PUBLIC_WHATSAPP_API_TOKEN } = process.env;

// Define the structure of a WhatsApp message
interface WhatsAppMessage {
  id: string;
  from: string;
  type: string;
  text?: { body: string };
}

// Define the structure of the request body
interface WhatsAppWebhookPayload {
  entry?: {
    changes?: {
      value?: {
        metadata?: { phone_number_id: string };
        messages?: WhatsAppMessage[];
      };
    }[];
  }[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    console.log("Incoming webhook message:", JSON.stringify(req.body, null, 2));

    const payload = req.body as WhatsAppWebhookPayload;
    const message = payload.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

    if (message?.type === "text" && message.text?.body) {
      const businessPhoneNumberId =
        payload.entry?.[0]?.changes?.[0]?.value?.metadata?.phone_number_id;

      if (!businessPhoneNumberId) {
        return res.status(400).json({ error: "Missing phone number ID" });
      }

      try {
        // Send a reply message
        await axios.post(
          `https://graph.facebook.com/v18.0/${businessPhoneNumberId}/messages`,
          {
            messaging_product: "whatsapp",
            to: message.from,
            text: { body: "Echo: " + message.text.body },
            context: { message_id: message.id },
          },
          {
            headers: {
              Authorization: `Bearer ${NEXT_PUBLIC_WHATSAPP_API_TOKEN}`,
            },
          }
        );

        // Mark message as read
        await axios.post(
          `https://graph.facebook.com/v18.0/${businessPhoneNumberId}/messages`,
          {
            messaging_product: "whatsapp",
            status: "read",
            message_id: message.id,
          },
          {
            headers: {
              Authorization: `Bearer ${NEXT_PUBLIC_WHATSAPP_API_TOKEN}`,
            },
          }
        );

        return res.status(200).send("Message processed");
      } catch (error: any) {
        console.error("Error sending message:", error.response?.data || error);
        return res.status(500).json({ error: "Error processing message" });
      }
    } else {
      return res.status(200).send("No text message detected");
    }
  } else if (req.method === "GET") {
    // Webhook verification
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode === "subscribe" && token === WHATSAPP_VERIFY_TOKEN) {
      console.log("Webhook verified successfully!");
      return res.status(200).send(challenge);
    } else {
      return res.status(403).send("Forbidden");
    }
  }

  return res.status(405).send("Method Not Allowed");
}
