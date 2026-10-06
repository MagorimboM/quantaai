// Which conversation to load. There is one conversation per company, and one
// per project when the user is inside a project (projectId null = company level).
export type GetChatHistoryRequest = {
  companyId: string;
  projectId: string | null;
};

// A question for the assistant. The backend works out who is asking from the
// user's Clerk token, so no userId is sent.
export type SendUserMessageRequest = {
  companyId: string;
  projectId: string | null;
  userMessage: string;
};