import { NextResponse } from "next/server";

const WHATSAPP_API_URL = "https://graph.facebook.com/v17.0";
const WHATSAPP_ACCESS_TOKEN = process.env.NEXT_PUBLIC_WHATSAPP_API_TOKEN;
const WHATSAPP_PHONE_NUMBER_ID =
  process.env.NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER_ID;

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
  console.log(data.id);
  return data.id;
}

async function sendMessage(
  phone: string,
  message: string,
  mediaId?: string,
  mediaType?: string,
  file?: File
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
        filename: file?.name,
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

export async function POST(req: Request): Promise<NextResponse> {
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

    let mediaId: string | undefined;
    let mediaType: string | undefined;

    if (file) {
      mediaId = await uploadMedia(file);

      const mimeType = file.type;
      if (mimeType.startsWith("image/")) {
        mediaType = "image";
      } else if (mimeType.startsWith("video/")) {
        mediaType = "video";
      } else if (mimeType.startsWith("audio/")) {
        mediaType = "audio";
      } else if (
        mimeType === "application/pdf" ||
        mimeType === "text/csv" ||
        mimeType === "application/vnd.ms-excel" ||
        mimeType ===
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      ) {
        mediaType = "document";
      } else {
        throw new Error(`Unsupported file type: ${mimeType}`);
      }
    }

    await sendMessage(phone, message, mediaId, mediaType, file ?? undefined);

    return NextResponse.json({
      success: true,
      message: "Message sent successfully!",
    });
  } catch (_error: any) {
    return NextResponse.json(
      { _error: _error.message || "Something went wrong!" },
      { status: 500 }
    );
  }
}
