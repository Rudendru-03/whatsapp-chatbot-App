import { NextRequest, NextResponse } from "next/server";

const WHATSAPP_ACCESS_TOKEN = process.env.NEXT_PUBLIC_WHATSAPP_API_TOKEN;
const PHONE_NUMBER_ID = process.env.NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER_ID;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const phone = formData.get("phone") as string;

    if (!phone) {
      return NextResponse.json(
        { error: "Phone number is required" },
        { status: 400 }
      );
    }

    const payload = {
      messaging_product: "whatsapp",
      to: phone,
      type: "template",
      template: {
        name: "form",
        language: {
          code: "en_US",
        },
        components: [
          {
            type: "header",
            parameters: [
              {
                type: "image",
                image: {
                  id: "28418804584401992",
                },
              },
            ],
          },
          {
            type: "button",
            sub_type: "flow",
            index: "0",
          },
        ],
      },
    };

    const response = await fetch(
      `https://graph.facebook.com/v19.0/${PHONE_NUMBER_ID}/messages`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();
    console.log(response);

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error.message },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: "Template message sent" });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
