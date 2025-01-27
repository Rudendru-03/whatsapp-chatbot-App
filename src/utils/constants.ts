// API endpoints
export const WHATSAPP_API_URL = "https://graph.facebook.com/v21.0/";

// Message types
export const MESSAGE_TYPES = {
  TEXT: "text",
  IMAGE: "image",
  DOCUMENT: "document",
  AUDIO: "audio",
  VIDEO: "video",
  STICKER: "sticker",
  LOCATION: "location",
  CONTACTS: "contacts",
};

// Product categories
export const PRODUCT_CATEGORIES = [
  "iPhone",
  "iPad",
  "MacBook",
  "Apple Watch",
  "AirPods",
];

// Conference types
export const CONFERENCE_TYPES = [
  "Tech Conference",
  "Business Seminar",
  "Workshop",
  "Webinar",
  "Networking Event",
];

// Broadcast message types
export const BROADCAST_TYPES = {
  PROMOTIONAL: "promotional",
  INFORMATIONAL: "informational",
  REMINDER: "reminder",
  SURVEY: "survey",
};

// Error messages
export const ERROR_MESSAGES = {
  INVALID_PHONE: "Invalid phone number format",
  MESSAGE_FAILED: "Failed to send message",
  BROADCAST_FAILED: "Failed to send broadcast message",
  PRODUCT_NOT_FOUND: "Product not found",
  CONFERENCE_NOT_FOUND: "Conference not found",
};

// Success messages
export const SUCCESS_MESSAGES = {
  MESSAGE_SENT: "Message sent successfully",
  BROADCAST_SENT: "Broadcast message sent successfully",
  PRODUCT_ADDED: "Product added successfully",
  CONFERENCE_CREATED: "Conference created successfully",
};

// Regex patterns
export const PHONE_REGEX = /^\+[1-9]\d{1,14}$/;

// Limits
export const MAX_BROADCAST_RECIPIENTS = 1000;
export const MAX_MESSAGE_LENGTH = 4096;
