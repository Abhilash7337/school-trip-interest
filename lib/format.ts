// Shared by server and browser code. A fixed time zone keeps both rendering the same text.
export function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  });
}

// "+919849012345" → "+91 98490 12345"
export const formatPhone = (phone: string) => phone.replace(/^\+91(\d{5})(\d{5})$/, "+91 $1 $2");
