import { apiClient } from "@/core/api/axios.api";
import type {
  GetChatHistoryRequest,
  SendUserMessageRequest,
} from "@/modules/aiAssistant/contracts/aiAssistant.request.contract";
import type { Message } from "@/modules/aiAssistant/contracts/aiAssistant.response.contract";

// Neither call sends a userId: the backend identifies the user from the Clerk
// token that apiClient attaches to every request.

// The latest messages of one conversation, oldest first.
async function getChatHistory(
  request: GetChatHistoryRequest,
): Promise<Message[]> {
  const response = await apiClient.get(
    `${request.companyId}/assistant/chatHistory`,
    // axios leaves projectId out of the URL when it is null (company-level chat)
    { params: { projectId: request.projectId } },
  );

  return response.data;
}

// Sends one question and returns the assistant's reply.
async function sendUserMessage(
  request: SendUserMessageRequest,
): Promise<Message> {
  const response = await apiClient.post(`${request.companyId}/assistant/chat`, {
    userMessage: request.userMessage,
    projectId: request.projectId,
  });

  return response.data;
}

export { getChatHistory, sendUserMessage };