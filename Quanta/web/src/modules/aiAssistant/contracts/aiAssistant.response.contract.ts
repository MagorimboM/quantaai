// One chat bubble. `id` is missing on a question the user has just typed,
// until the backend has saved it.
export type Message = {
  id?: string;
  role: "user" | "assistant";
  content: string;
};