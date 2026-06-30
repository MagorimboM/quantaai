import { apiClient } from "@/core/api/axios.api";
import { globalErrorState } from "@/common/storage/globalState";

type Message = {
  id?: string;
  role: "user" | "assistant";
  content: string;
};

async function getChatHistory(): Promise<Message[]> {
  const response = await apiClient.get(
    "assistant/chatHistory/seed-proj-001/seed-user-001",
  );

  return Array.isArray(response.data) ? response.data : [];
}

async function sendUserMessage(userMessage: string): Promise<Message> {
  const response = await apiClient.post("assistant/chat", {
    userMessage,
    userId: "seed-user-001",
    projectId: "seed-proj-001",
    companyId: "seed-company-001",
    role: "user",
  });
  return response.data;
}

export { getChatHistory, sendUserMessage };
