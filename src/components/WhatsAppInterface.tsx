'use client';

import { JSX, useState, useRef, useEffect } from "react";

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

export default function SendMessagePage(): JSX.Element {
  const [phone, setPhone] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [responseMessage, setResponseMessage] = useState<{
    success: boolean;
    message: string
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const broadcastNumbers = ["919370435262", "918810609657", "918745813705"];

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await fetch('/api/messages');
        const data = await res.json();
        setMessages(data.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        })));
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!phone || !message) return;

    const newMessage: Message = {
      content: message,
      isSent: true,
      timestamp: new Date(),
      status: 'sent',
      to: phone,
      ...(file && {
        file: {
          name: file.name,
          type: file.type,
          url: URL.createObjectURL(file)
        }
      })
    };

    try {
      const formData = new FormData();
      formData.append("phone", phone);
      formData.append("message", message);
      if (file) formData.append("file", file);

      const res = await fetch("/api/send-message", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();

      setResponseMessage(res.ok ?
        { success: true, message: `Message sent to ${phone}` } :
        { success: false, message: result.error || "Failed to send message" }
      );

      setMessages(prev => [...prev, {
        ...newMessage,
        status: res.ok ? 'delivered' : 'sent'
      }]);

    } catch (error) {
      setResponseMessage({
        success: false,
        message: "Failed to connect to server"
      });
      setMessages(prev => [...prev, newMessage]);
    }

    setMessage("");
    setFile(null);
  };

  const broadcastMessages = async () => {
    for (const number of broadcastNumbers) {
      const formData = new FormData();
      formData.append("phone", number);
      formData.append("message", message);
      if (file) formData.append("file", file);

      await fetch("/api/send-message", {
        method: "POST",
        body: formData,
      });
    }
    setResponseMessage({
      success: true,
      message: `Broadcasted to ${broadcastNumbers.length} contacts`
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setFile(e.target.files[0]);
  };

  const triggerFileInput = () => fileInputRef.current?.click();

  return (
    <div className="h-full flex flex-col bg-[#ece5dd]">
      {/* Chat Header */}
      <div className="bg-[#075e54] p-4 flex items-center justify-between">
        <input
          type="text"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Enter phone number (+1234567890)"
          className="bg-transparent text-white placeholder-gray-300 focus:outline-none w-full"
        />
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#efeae2]">
        {isLoading ? (
          <div className="text-center text-gray-500">Loading messages...</div>
        ) : messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.isSent ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`p-3 rounded-lg max-w-[80%] shadow ${msg.isSent ? 'bg-[#dcf8c6]' : 'bg-white'
              }`}>
              {!msg.isSent && (
                <div className="text-xs text-gray-500 mb-1">
                  From: {msg.from}
                </div>
              )}
              {msg.file && (
                <div className="mb-2">
                  {msg.file.type.startsWith('image/') ? (
                    <img
                      src={msg.file.url}
                      alt={msg.file.name}
                      className="max-w-full h-48 object-cover rounded"
                    />
                  ) : (
                    <div className="text-sm text-gray-500 flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      {msg.file.name}
                    </div>
                  )}
                </div>
              )}
              <p className="text-gray-800">{msg.content}</p>
              <div className="flex items-center justify-end gap-2 mt-2">
                <span className="text-xs text-gray-500">
                  {msg.timestamp.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
                {msg.isSent && (
                  <span className="text-xs text-gray-500">
                    {msg.status === 'read' ? '✓✓' :
                      msg.status === 'delivered' ? '✓' : '◷'}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white p-4 border-t border-gray-200">
        <form onSubmit={sendMessage} className="flex gap-2">
          <div className="relative flex-1">
            <button
              type="button"
              onClick={triggerFileInput}
              className="absolute left-2 top-2 text-[#075e54] hover:text-[#128c7e]"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                />
              </svg>
            </button>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message"
              className="w-full border rounded-2xl py-2 px-4 pl-12 pr-4 resize-none focus:outline-none focus:border-[#075e54]"
              rows={1}
              required
            />
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
            {file && (
              <div className="absolute bottom-12 left-0 bg-white p-2 rounded-lg shadow flex items-center">
                <span className="text-sm text-gray-600 mr-2">{file.name}</span>
                <button
                  type="button"
                  onClick={() => setFile(null)}
                  className="text-red-500 hover:text-red-700"
                >
                  ×
                </button>
              </div>
            )}
          </div>
          <button
            type="submit"
            className="bg-[#075e54] text-white p-2 rounded-full w-10 h-10 flex items-center justify-center hover:bg-[#054d43]"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </button>
        </form>

        <button
          onClick={broadcastMessages}
          className="mt-2 w-full text-center text-sm text-[#075e54] hover:text-[#054d43]"
        >
          Broadcast Message
        </button>
      </div>

      {/* Status Messages */}
      {responseMessage && (
        <div className={`p-2 text-center text-sm ${responseMessage.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
          {responseMessage.message}
        </div>
      )}
    </div>
  );
}