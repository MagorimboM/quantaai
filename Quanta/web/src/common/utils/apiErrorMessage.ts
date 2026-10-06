// Reads the message the backend sent with a failed request ("A recipe with
// this name already exists"), so it can be shown next to the form that caused
// it. Server errors (5xx) and anything without a message, such as the network
// being down, use the fallback text instead of leaking technical wording.
export function apiErrorMessage(error: unknown, fallback: string): string {
  const response = (
    error as {
      response?: { status?: number; data?: { message?: string | string[] } };
    } | null
  )?.response;

  if (!response || (response.status ?? 0) >= 500) return fallback;

  const message = response.data?.message;
  if (Array.isArray(message)) return message.join(". ");
  return message ?? fallback;
}