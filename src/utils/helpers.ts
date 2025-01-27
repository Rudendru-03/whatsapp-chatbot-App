import { PHONE_REGEX, MAX_MESSAGE_LENGTH } from "./constants";

/**
 * Validates a phone number
 * @param phone The phone number to validate
 * @returns True if the phone number is valid, false otherwise
 */
export function isValidPhoneNumber(phone: string): boolean {
  return PHONE_REGEX.test(phone);
}

/**
 * Formats a phone number to the international format
 * @param phone The phone number to format
 * @returns The formatted phone number
 */
export function formatPhoneNumber(phone: string): string {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, "");

  // Assume it's a US number if it starts with 1 and has 11 digits
  if (digits.length === 11 && digits[0] === "1") {
    return `+${digits}`;
  }

  // Otherwise, just add the + sign
  return `+${digits}`;
}

/**
 * Truncates a message to the maximum allowed length
 * @param message The message to truncate
 * @returns The truncated message
 */
export function truncateMessage(message: string): string {
  if (message.length <= MAX_MESSAGE_LENGTH) {
    return message;
  }
  return message.slice(0, MAX_MESSAGE_LENGTH - 3) + "...";
}

/**
 * Generates a random string of specified length
 * @param length The length of the string to generate
 * @returns A random string
 */
export function generateRandomString(length: number): string {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

/**
 * Formats a date to a human-readable string
 * @param date The date to format
 * @returns A formatted date string
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Calculates the time difference between two dates
 * @param date1 The first date
 * @param date2 The second date
 * @returns A string representing the time difference
 */
export function getTimeDifference(date1: Date, date2: Date): string {
  const diffInSeconds = Math.abs(date2.getTime() - date1.getTime()) / 1000;
  const days = Math.floor(diffInSeconds / 86400);
  const hours = Math.floor((diffInSeconds % 86400) / 3600);
  const minutes = Math.floor((diffInSeconds % 3600) / 60);

  if (days > 0) {
    return `${days} day${days > 1 ? "s" : ""}`;
  } else if (hours > 0) {
    return `${hours} hour${hours > 1 ? "s" : ""}`;
  } else {
    return `${minutes} minute${minutes > 1 ? "s" : ""}`;
  }
}

/**
 * Capitalizes the first letter of each word in a string
 * @param str The string to capitalize
 * @returns The capitalized string
 */
export function capitalizeWords(str: string): string {
  return str.replace(/\b\w/g, (l) => l.toUpperCase());
}
