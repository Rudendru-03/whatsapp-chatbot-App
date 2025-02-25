import { NextRequest, NextResponse } from "next/server";
import amqp from "amqplib";

const WHATSAPP_ACCESS_TOKEN = process.env.NEXT_PUBLIC_WHATSAPP_API_TOKEN;;
const PHONE_NUMBER_ID = process.env.NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER_ID;;
const QUEUE_NAME = "whatsapp_queue";

// Function to send WhatsApp message using fetch API
const sendWhatsAppMessage = async (phoneNumber: string, message: string) => {
    try {
        const response = await fetch(`https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                messaging_product: "whatsapp",
                to: phoneNumber,
                type: "text",
                text: { body: message },
            }),
        });

        const data = await response.json();
        console.log("WhatsApp message response:", data);
    } catch (error) {
        console.error("Error sending WhatsApp message:", error);
    }
};

// Function to consume messages from RabbitMQ
const consumeMessages = async () => {
    try {
        const connection = await amqp.connect("amqp://localhost");
        const channel = await connection.createChannel();
        await channel.assertQueue(QUEUE_NAME, { durable: true });

        console.log("Waiting for messages...");

        channel.consume(
            QUEUE_NAME,
            async (msg) => {
                if (msg !== null) {
                    const { phoneNumber, message } = JSON.parse(msg.content.toString());
                    console.log(`Processing message:`, { phoneNumber, message });

                    await sendWhatsAppMessage(phoneNumber, message);
                    channel.ack(msg);
                }
            },
            { noAck: false }
        );
    } catch (error) {
        console.error("RabbitMQ Consumer Error:", error);
    }
};

// Start the consumer when the server starts
// consumeMessages();

// API to send message to RabbitMQ
export async function POST(req: NextRequest) {
    try {
        const { phoneNumber, message } = await req.json();

        if (!phoneNumber || !message) {
            return NextResponse.json({ error: "phoneNumber and message are required" }, { status: 400 });
        }

        const connection = await amqp.connect("amqp://localhost");
        const channel = await connection.createChannel();
        await channel.assertQueue(QUEUE_NAME, { durable: true });

        channel.sendToQueue(QUEUE_NAME, Buffer.from(JSON.stringify({ phoneNumber, message })), {
            persistent: true,
        });

        console.log(`Message added to queue:`, { phoneNumber, message });

        await channel.close();
        await connection.close();

        return NextResponse.json({ success: true, message: "Message added to queue" });
    } catch (error) {
        console.error("Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
