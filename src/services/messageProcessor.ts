import rabbitmqService from "@/lib/rabbitmq";
import { sendMainMenu, sendCatalogMessage, sendShippingUpdate, handleNotificationOptIn } from "@/lib/whatsapp-api";

export async function startMessageProcessing() {
    // Process incoming messages
    await rabbitmqService.consumeMessages('incoming_messages', async (message) => {
        try {
            console.log('Processing message:', message);
            const { from, content, type } = message;
            
            // Here you can implement all your business logic
            if (type === "text") {
                await sendMainMenu(from);
            }
            
            // Process based on message content
            if (content.toLowerCase().includes('product')) {
                await sendCatalogMessage(from);
            } else if (content.toLowerCase().includes('shipping')) {
                await sendShippingUpdate(from);
            } else if (content.toLowerCase().includes('notify')) {
                await handleNotificationOptIn(from);
            }
            
        } catch (error) {
            console.error('Error processing message:', error);
        }
    });
    
    // Process interactive responses separately
    await rabbitmqService.consumeMessages('interactive_responses', async (message) => {
        try {
            console.log('Processing interactive response:', message);
            const { from, selection } = message;
            
            switch (selection.id) {
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
        } catch (error) {
            console.error('Error processing interactive response:', error);
        }
    });
}