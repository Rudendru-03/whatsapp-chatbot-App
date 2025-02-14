import { NextRequest, NextResponse } from "next/server";
import * as xlsx from "xlsx";
import * as fs from "fs";
import * as path from "path";
// import { appendToGoogleSheet } from "@/lib/googleSheets";

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;
const WHATSAPP_API_TOKEN = process.env.NEXT_PUBLIC_WHATSAPP_API_TOKEN;
const WHATSAPP_PHONE_NUMBER_ID = process.env.NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER_ID;
let messageHistory: any[] = [];
const filePath = path.join(process.cwd(), "src/data/Users.xlsx");

export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams;
    const mode = searchParams.get("hub.mode");
    const token = searchParams.get("hub.verify_token");
    const challenge = searchParams.get("hub.challenge");

    if (mode === "subscribe" && token === VERIFY_TOKEN) {
        console.log("✅ Webhook verified");
        return new NextResponse(challenge, { status: 200 });
    } else {
        console.log("❌ Webhook verification failed");
        return new NextResponse("Forbidden", { status: 403 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        console.log("📥 Received webhook payload:", JSON.stringify(body, null, 2));

        const entry = body.entry?.[0];
        if (entry) {
            const changes = entry.changes?.[0];
            if (changes) {
                // Handle incoming messages
                if (changes.value.messages) {
                    const message = changes.value.messages[0];
                    const from = message.from;
                    console.log(`📩 New message from ${from}: ${message.type}`);

                    if (message.type === "text") {
                        messageHistory.push({
                            type: "received",
                            from,
                            message: message.text.body,
                            timestamp: new Date().toISOString()
                        });
                    }

                    if (["image", "document", "audio", "video", "sticker"].includes(message.type)) {
                        const media = message[message.type];
                        messageHistory.push({
                            type: "received",
                            from,
                            message: `[${message.type.toUpperCase()}] ${media.caption || ''}`,
                            mediaUrl: media.url || media.link,
                            mediaType: message.type,
                            timestamp: new Date().toISOString()
                        });
                    }

                    if (message.type === "interactive") {
                        const interaction = message.interactive;
                        if (interaction.type === "list_reply") {
                            const selected = interaction.list_reply;
                            console.log(`🔘 List selection from ${from}: ${selected.title}`);
                            messageHistory.push({
                                type: "received",
                                from,
                                message: `${selected.title}`,
                                timestamp: new Date().toISOString()
                            });

                            switch (selected.id) {
                                case "inventory_row":
                                    await sendCatalogMessage(from);
                                    break;
                                case "shipping_row":
                                    await sendShippingUpdate(from);
                                    break;
                                case "notifications_row":
                                    await handleNotificationOptIn(from);
                                    break;
                            }
                        }
                        else if (interaction.type === "nfm_reply") {
                            try {
                                const flowResponse = JSON.parse(interaction.nfm_reply.response_json);
                                console.log("🌊 Flow submission received from:", from, flowResponse);

                                // Handle Excel file update
                                let jsonData: any[] = [];
                                if (fs.existsSync(filePath)) {
                                    const fileBuffer = fs.readFileSync(filePath);
                                    const workbook = xlsx.read(fileBuffer, { type: "buffer" });
                                    const sheetName = workbook.SheetNames[0];
                                    const sheet = workbook.Sheets[sheetName];
                                    jsonData = xlsx.utils.sheet_to_json(sheet);
                                }

                                jsonData.push({
                                    Name: "Omkar Nilawar",
                                    Email: "omkar@squaregroup.tech",
                                    Phone: "+919370435262"
                                });

                                console.log("📝 Appending data to Excel file...");
                                const newWorksheet = xlsx.utils.json_to_sheet(jsonData);
                                const newWorkbook = xlsx.utils.book_new();
                                xlsx.utils.book_append_sheet(newWorkbook, newWorksheet, "Sheet1");
                                xlsx.writeFile(newWorkbook, filePath);
                                console.log("✅ Data appended successfully");

                                messageHistory.push({
                                    type: "flow_submission",
                                    from,
                                    flowData: flowResponse,
                                    timestamp: new Date().toISOString()
                                });

                            } catch (error) {
                                console.error("❌ Error processing flow response:", error);
                            }
                        }
                    }
                }

                // Handle message status updates
                if (changes.value.statuses) {
                    const statuses = changes.value.statuses;
                    console.log(`📊 Received ${statuses.length} status updates`);

                    for (const status of statuses) {
                        console.log(`🔄 Status update for message ${status.id}: ${status.status}`);
                        messageHistory.push({
                            type: "status_update",
                            messageId: status.id,
                            status: status.status,
                            timestamp: new Date(parseInt(status.timestamp) * 1000).toISOString(),
                            recipientId: status.recipient_id,
                            conversation: status.conversation,
                            pricing: status.pricing
                        });
                    }
                }
            }
        }
        return new NextResponse("EVENT_RECEIVED", { status: 200 });
    } catch (error) {
        console.error("❌ Error processing webhook event:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

// Existing functions remain the same with enhanced logging
async function sendCatalogMessage(to: string) {
    console.log(`📋 Sending catalog to ${to}`);
    const url = `https://graph.facebook.com/v19.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`;

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${WHATSAPP_API_TOKEN}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                messaging_product: "whatsapp",
                recipient_type: "individual",
                to: to,
                type: "interactive",
                interactive: {
                    type: "product_list",
                    header: {
                        type: "text",
                        text: "Explore Our Latest Products",
                    },
                    body: {
                        text: "Check out our best-selling products and choose the one that suits your needs.",
                    },
                    footer: {
                        text: "Tap on a product to learn more.",
                    },
                    action: {
                        catalog_id: "643442681458392",
                        sections: [
                            {
                                title: "Trending Products",
                                product_items: [
                                    { product_retailer_id: "16A" },
                                    { product_retailer_id: "14A" },
                                    { product_retailer_id: "15A" },
                                    { product_retailer_id: "13A" },
                                ],
                            },
                        ],
                    },
                },
            }),
        });

        const responseData = await response.json();
        if (!response.ok) throw responseData;

        console.log(`✅ Catalog sent to ${to}, Message ID: ${responseData.messages?.[0]?.id}`);
        messageHistory.push({
            type: "sent",
            to,
            messageId: responseData.messages?.[0]?.id,
            messageType: "catalog",
            timestamp: new Date().toISOString()
        });

        return responseData;
    } catch (error) {
        console.error("❌ Catalog send failed:", error);
        throw error;
    }
}

async function sendShippingUpdate(to: string) {
    console.log(`🚚 Sending shipping update to ${to}`);
    const url = `https://graph.facebook.com/v19.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`;

    const data = {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: to,
        type: "text",
        text: {
            body: "Please enter your order number to check shipping status:"
        }
    };

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${WHATSAPP_API_TOKEN}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorResponse = await response.json();
            console.error("Error sending shipping update:", errorResponse);
            throw new Error(`Failed to send shipping update: ${errorResponse.error.message}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error sending shipping update:", error);
        throw error;
    }
}

async function handleNotificationOptIn(to: string) {
    console.log(`🔔 Handling notifications for ${to}`);
    const url = `https://graph.facebook.com/v19.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`;

    const data = {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: to,
        type: "interactive",
        interactive: {
            type: "button",
            body: {
                text: "Receive notifications about orders and promotions?"
            },
            action: {
                buttons: [
                    {
                        type: "reply",
                        reply: {
                            id: "optin_yes",
                            title: "Yes, please!"
                        }
                    },
                    {
                        type: "reply",
                        reply: {
                            id: "optin_no",
                            title: "Not now"
                        }
                    }
                ]
            }
        }
    };

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${WHATSAPP_API_TOKEN}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorResponse = await response.json();
            console.error("Error handling notification opt-in:", errorResponse);
            throw new Error(`Failed to send opt-in: ${errorResponse.error.message}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error handling notification opt-in:", error);
        throw error;
    }
}