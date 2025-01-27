const WHATSAPP_API_URL = "https://graph.facebook.com/v17.0";

async function sendWhatsAppRequest(endpoint: string, body: any) {
  const response = await fetch(
    `${WHATSAPP_API_URL}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/${endpoint}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to send WhatsApp message");
  }

  return response.json();
}

export async function sendWhatsAppMessage(to: string, message: string) {
  return sendWhatsAppRequest("messages", {
    messaging_product: "whatsapp",
    to,
    type: "text",
    text: { body: message },
  });
}

export async function sendWhatsAppImage(to: string, imageUrl: string) {
  return sendWhatsAppRequest("messages", {
    messaging_product: "whatsapp",
    to,
    type: "image",
    image: { link: imageUrl },
  });
}

export async function sendWhatsAppAudio(to: string, audioUrl: string) {
  return sendWhatsAppRequest("messages", {
    messaging_product: "whatsapp",
    to,
    type: "audio",
    audio: { link: audioUrl },
  });
}

export async function sendWhatsAppDocument(to: string, documentUrl: string) {
  return sendWhatsAppRequest("messages", {
    messaging_product: "whatsapp",
    to,
    type: "document",
    document: { link: documentUrl },
  });
}

export async function sendWhatsAppLocation(
  to: string,
  latitude: number,
  longitude: number
) {
  return sendWhatsAppRequest("messages", {
    messaging_product: "whatsapp",
    to,
    type: "location",
    location: { latitude, longitude },
  });
}

export async function sendWhatsAppContact(to: string, vcard: string) {
  return sendWhatsAppRequest("messages", {
    messaging_product: "whatsapp",
    to,
    type: "contacts",
    contacts: [{ vcard }],
  });
}

export async function sendWhatsAppSticker(to: string, stickerUrl: string) {
  return sendWhatsAppRequest("messages", {
    messaging_product: "whatsapp",
    to,
    type: "sticker",
    sticker: { link: stickerUrl },
  });
}
