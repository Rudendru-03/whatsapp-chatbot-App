"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import EmojiPicker from "emoji-picker-react"
import { Smile, Image, Paperclip, MapPin, Contact2, Sticker, Link } from "lucide-react"

type MessageType = "text" | "contact" | "audio" | "document" | "location" | "image" | "sticker" | "contacts" | "interactive" | "template"

interface Message {
  type: MessageType
  content: string
  phoneNumber: string
  link?: string
  messageId?: string
  latitude?: string
  longitude?: string
  name?: string
  address?: string
}

export default function WhatsAppInterface() {
  const [message, setMessage] = useState<Message>({
    type: "text",
    content: "",
    phoneNumber: "",
  })
  const [link, setLink] = useState("")
  const [messageId, setMessageId] = useState("")
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef(null);

  const constructRequestBody = (message: Message) => {
    const baseBody = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: message.phoneNumber,
      type: message.type,
    }

    switch (message.type) {
      case "text":
        return {
          ...baseBody,
          text: {
            preview_url: !!message.link,
            body: message.content
          }
        }

      case "location":
        return {
          ...baseBody,
          location: {
            latitude: parseFloat(message.latitude || "0"),
            longitude: parseFloat(message.longitude || "0"),
            name: message.name || "",
            address: message.address || ""
          }
        }

      case "image":
        const imageBody: any = {
          ...baseBody,
          image: {
            link: message.link
          }
        }
        if (message.messageId) {
          imageBody.context = {
            message_id: message.messageId
          }
        }
        return imageBody

      case "interactive":
        return {
          ...baseBody,
          interactive: {
            type: "button",
            body: {
              text: message.content
            },
            action: {
              buttons: [
                {
                  type: "reply",
                  reply: {
                    id: "button_1",
                    title: "Button 1"
                  }
                },
                {
                  type: "reply",
                  reply: {
                    id: "button_2",
                    title: "Button 2"
                  }
                }
              ]
            }
          }
        }

      default:
        return baseBody
    }
  }

  const handleSend = async () => {
    if (!message.phoneNumber || !message.content) {
      alert("Please enter both phone number and message content")
      return
    }

    const endpoint = `${process.env.NEXT_PUBLIC_WHATSAPP_API_URL}/${process.env.NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER_ID}/messages`
    console.log("endpoint: " + endpoint);
    console.log("constructRequestBody: " + JSON.stringify(constructRequestBody(message)));

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.NEXT_PUBLIC_WHATSAPP_API_TOKEN}`
        },
        body: JSON.stringify(constructRequestBody(message))
      })

      if (response.ok) {
        alert("Message sent successfully")
        setMessages((prevMessages) => [...prevMessages, message]);
        setMessage({ ...message, content: "" })
        setLink("")
        setMessageId("")
      } else {
        alert("Failed to send message")
      }
    } catch (error) {
      alert("Error sending message")
      console.error(error)
    }
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex h-full flex-col bg-whatsapp-light">
      <div className="bg-primary p-4">
        <Input
          value={message.phoneNumber}
          onChange={(e) => setMessage({ ...message, phoneNumber: e.target.value })}
          placeholder="Enter phone number"
          className="bg-white mb-2"
        />
      </div>
      <div className="flex-1 p-4 overflow-y-auto">
        {messages.length === 0 ? (
          <p className="text-gray-500 text-center">No messages yet</p>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`p-2 my-2 rounded-lg ${msg.phoneNumber === message.phoneNumber
                ? "bg-green-200 self-end text-right"
                : "bg-gray-200 self-start text-left"
                }`}
            >
              <p className="font-semibold">{msg.phoneNumber}</p>
              <p>{msg.content}</p>
            </div>
          ))
        )}
      </div>
      <Card className="rounded-none border-t">
        <Tabs defaultValue="text" className="w-full">
          <TabsList className="grid w-full grid-cols-6 bg-white p-0">
            <TabsTrigger value="text" className="data-[state=active]:bg-primary/10">
              <span className="sr-only">Text</span>
              <Smile className="h-5 w-5" />
            </TabsTrigger>
            <TabsTrigger value="image" className="data-[state=active]:bg-primary/10">
              <span className="sr-only">Image</span>
              <Image className="h-5 w-5" />
            </TabsTrigger>
            <TabsTrigger value="location" className="data-[state=active]:bg-primary/10">
              <span className="sr-only">Location</span>
              <MapPin className="h-5 w-5" />
            </TabsTrigger>
            <TabsTrigger value="interactive" className="data-[state=active]:bg-primary/10">
              <span className="sr-only">Interactive</span>
              <Contact2 className="h-5 w-5" />
            </TabsTrigger>
          </TabsList>

          <div className="p-4">
            <TabsContent value="text" className="m-0">
              <div className="relative space-y-4">
                <Textarea
                  value={message.content}
                  onChange={(e) => setMessage({ ...message, content: e.target.value, type: "text" })}
                  placeholder="Type a message"
                  className="min-h-[100px] resize-none pr-10"
                />
                <Input
                  value={link}
                  onChange={(e) => {
                    setLink(e.target.value)
                    setMessage({ ...message, link: e.target.value })
                  }}
                  placeholder="Add a link (optional)"
                />
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" className="absolute top-2 right-2 h-8 w-8 rounded-full p-0">
                      <Smile className="h-5 w-5" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <EmojiPicker
                      onEmojiClick={(emojiData) =>
                        setMessage({ ...message, content: message.content + emojiData.emoji })
                      }
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </TabsContent>

            <TabsContent value="image" className="m-0 space-y-4">
              <Input
                value={link}
                onChange={(e) => {
                  setLink(e.target.value)
                  setMessage({ ...message, type: "image", link: e.target.value })
                }}
                placeholder="Image URL"
                className="mb-4"
              />
              <Input
                value={messageId}
                onChange={(e) => {
                  setMessageId(e.target.value)
                  setMessage({ ...message, messageId: e.target.value })
                }}
                placeholder="Previous Message ID (optional)"
              />
            </TabsContent>

            <TabsContent value="location" className="m-0 space-y-4">
              <Input
                placeholder="Latitude"
                onChange={(e) =>
                  setMessage({
                    ...message,
                    type: "location",
                    latitude: e.target.value
                  })
                }
              />
              <Input
                placeholder="Longitude"
                onChange={(e) =>
                  setMessage({
                    ...message,
                    type: "location",
                    longitude: e.target.value
                  })
                }
              />
              <Input
                placeholder="Location Name"
                onChange={(e) =>
                  setMessage({
                    ...message,
                    name: e.target.value
                  })
                }
              />
              <Input
                placeholder="Address"
                onChange={(e) =>
                  setMessage({
                    ...message,
                    address: e.target.value
                  })
                }
              />
            </TabsContent>

            <TabsContent value="interactive" className="m-0">
              <Textarea
                value={message.content}
                onChange={(e) => setMessage({ ...message, content: e.target.value, type: "interactive" })}
                placeholder="Enter button message content"
                className="min-h-[100px]"
              />
            </TabsContent>

            <Button className="mt-4 w-full bg-primary hover:bg-primary/90" onClick={handleSend}>
              Send Message
            </Button>
          </div>
        </Tabs>
      </Card>
    </div>
  )
}