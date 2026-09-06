import { apiClient } from "@/core/api/axios.api";
import type { Message } from "@/modules/aiAssistant/contracts/aiAssistant.request.contract";

async function getChatHistory(): Promise<Message[]> {
  const response = await apiClient.get(
    "seed-company-001/assistant/chatHistory/seed-proj-001/seed-user-001",
  );

  return Array.isArray(response.data) ? response.data : [];
}

async function sendUserMessage(userMessage: string): Promise<Message> {
  const response = await apiClient.post("seed-company-001/assistant/chat", {
    userMessage,
    userId: "seed-user-001",
    projectId: "seed-proj-001",
    companyId: "seed-company-001",
    role: "user",
  });
  return response.data;
}

export { getChatHistory, sendUserMessage };
