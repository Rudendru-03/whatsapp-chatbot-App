import { NextResponse } from "next/server";

interface Message {
    content: string;
    isSent: boolean;
    timestamp: Date;
    status: 'sent' | 'delivered' | 'read';
    from?: string;
    to?: string;
    file?: {
        name: string;
        type: string;
        url: string;
    };
}

let messages: Message[] = [];

export async function GET() {
    return NextResponse.json(messages);
}

export async function POST(req: Request) {
    const message = await req.json();
    messages.push({
        ...message,
        timestamp: new Date(message.timestamp)
    });
    return NextResponse.json({ success: true });
}

export const dynamic = 'force-dynamic';