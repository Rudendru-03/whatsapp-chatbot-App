import { NextResponse } from "next/server";
import { WhatsAppMessage, messageStorage, MediaType } from "@/lib/types";

const WHATSAPP_API = "https://graph.facebook.com/v17.0";
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const PHONE_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

async function uploadMedia(file: File): Promise<{ id: string, type: MediaType }> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("messaging_product", "whatsapp");

  const uploadRes = await fetch(
    `${WHATSAPP_API}/${PHONE_ID}/media`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
      body: formData
    }
  );

  if (!uploadRes.ok) throw new Error("Media upload failed");
  
  const { id, mime_type } = await uploadRes.json();
  
  // Media type detection
  const [typePrefix] = mime_type.split('/');
  const typeMap: Record<string, MediaType> = {
    image: 'image',
    video: 'video',
    audio: 'audio',
    application: 'document',
    text: 'document'
  };
  
  return { id, type: typeMap[typePrefix] || 'document' };
}

async function sendMessage(payload: object): Promise<string> {
  const res = await fetch(
    `${WHATSAPP_API}/${PHONE_ID}/messages`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${ACCESS_TOKEN}`
      },
      body: JSON.stringify(payload)
    }
  );

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error?.message || "Message sending failed");
  }
  
  const data = await res.json();
  return data.messages[0].id;
}

export async function POST(req: Request) {
  let tempId: string | null = null;

  try {
    const formData = await req.formData();
    const phone = formData.get("phone") as string;
    const message = formData.get("message") as string;
    const file = formData.get("file") as File | null;

    if (!phone || !message) {
      return NextResponse.json(
        { error: "Phone and message are required" },
        { status: 400 }
      );
    }

    // Create temporary message
    tempId = `temp-${Date.now()}`;
    const tempMessage: WhatsAppMessage = {
      id: tempId,
      content: message,
      from: phone,
      timestamp: new Date(),
      isSent: true,
      status: 'sent',
      media: undefined
    };

    let payload: object;
    let mediaInfo: { id: string, type: MediaType } | null = null;

    if (file) {
      mediaInfo = await uploadMedia(file);
      tempMessage.media = {
        id: 'temp',
        type: mediaInfo.type,
        caption: message
      };
      payload = {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: phone,
        type: mediaInfo.type,
        [mediaInfo.type]: {
          id: mediaInfo.id,
          caption: message,
          filename: file.name
        }
      };
    } else {
      payload = {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: phone,
        type: "text",
        text: { body: message }
      };
    }

    messageStorage.add(tempMessage);
    const messageId = await sendMessage(payload);

    // Update with final message details
    messageStorage.update(tempId, {
      id: messageId,
      status: 'delivered',
      ...(mediaInfo && {
        media: {
          id: mediaInfo.id,
          type: mediaInfo.type,
          caption: message
        }
      })
    });

    return NextResponse.json({ success: true, messageId });

  } catch (error: any) {
    if (tempId) {
      messageStorage.update(tempId, { status: 'failed' });
    }
    return NextResponse.json(
      { error: error.message || "Failed to send message" },
      { status: 500 }
    );
  }
}