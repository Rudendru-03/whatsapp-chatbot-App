import { type NextRequest, NextResponse } from "next/server";
import { messageStore } from "../../../lib/messageStore";

const WHATSAPP_API_URL = "https://graph.facebook.com/v17.0";
const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

export async function POST(req: NextRequest) {
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

  try {
    let mediaId: string | undefined;
    let mediaType: string | undefined;

    if (file) {
      mediaId = await uploadMedia(file);
      mediaType = getMediaType(file.type);
    }

    await sendWhatsAppMessage(phone, message, mediaId, mediaType, file?.name);

    messageStore.addMessage({
      content: message,
      isSent: true,
      timestamp: new Date().toISOString(),
      status: "sent",
      from: WHATSAPP_PHONE_NUMBER_ID!,
      to: phone,
    });

    return NextResponse.json({
      success: true,
      message: "Message sent successfully",
    });
  } catch (error: any) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { error: error.message || "Failed to send message" },
      { status: 500 }
    );
  }
}

async function uploadMedia(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("messaging_product", "whatsapp");

  const response = await fetch(
    `${WHATSAPP_API_URL}/${WHATSAPP_PHONE_NUMBER_ID}/media`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
      },
      body: formData,
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error.message || "Failed to upload media");
  }

  const data = await response.json();
  return data.id;
}

function getMediaType(mimeType: string): string {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType.startsWith("audio/")) return "audio";
  if (
    mimeType === "application/pdf" ||
    mimeType === "text/csv" ||
    mimeType === "application/vnd.ms-excel" ||
    mimeType ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  ) {
    return "document";
  }
  throw new Error(`Unsupported file type: ${mimeType}`);
}

async function sendWhatsAppMessage(
  phone: string,
  message: string,
  mediaId?: string,
  mediaType?: string,
  fileName?: string
): Promise<void> {
  const payload: any = {
    messaging_product: "whatsapp",
    to: phone,
    type: mediaType || "text",
  };

  if (mediaId && mediaType) {
    if (["image", "video", "document"].includes(mediaType)) {
      payload[mediaType] = {
        id: mediaId,
        caption: message,
        filename: fileName,
      };
    } else {
      payload[mediaType] = { id: mediaId };
    }
  } else {
    payload.text = { body: message };
  }

  const response = await fetch(
    `${WHATSAPP_API_URL}/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
      },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error.message || "Failed to send message");
  }
}
