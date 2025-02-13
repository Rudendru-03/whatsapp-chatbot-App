import { NextRequest, NextResponse } from "next/server";

const WHATSAPP_ACCESS_TOKEN = process.env.NEXT_PUBLIC_WHATSAPP_API_TOKEN;
const PHONE_NUMBER_ID = process.env.NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER_ID;

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const phone = formData.get("phone") as string;

        if (!phone) {
            return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
        }

        const payload = {
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to: phone,
            type: "interactive",
            interactive: {
                type: "list",
                header: {
                    type: "text",
                    text: "Square Group"
                },
                body: {
                    text: "Please select an option from the list:"
                },
                footer: {
                    text: "Click on product for more information"
                },
                action: {
                    button: "Main Menu",
                    sections: [
                        {
                            title: "Our Products",
                            rows: [
                                {
                                    id: "inventory_row",
                                    title: "📦 Available Inventory",
                                    description: "Check the latest stock."
                                },
                                {
                                    id: "shipping_row",
                                    title: "📦 Shipping Status",
                                    description: "Track your orders."
                                },
                                {
                                    id: "notifications_row",
                                    title: "🚚 Notifications Opt-In",
                                    description: "Stay updated on new arrivals"
                                }
                            ]
                        }
                    ]
                }
            }
        };

        const response = await fetch(`https://graph.facebook.com/v19.0/${PHONE_NUMBER_ID}/messages`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
            },
            body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json({ error: data.error.message }, { status: response.status });
        }

        return NextResponse.json({ success: "Interactive message sent" });
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}