import { apiClient } from "@/core/api/axios.api";

type Message = {
  id?: string;
  role: "user" | "ai";
  content: string;
};


async function getChatHistory(): Promise<Message[]> {
  const response = await apiClient.get("ai/chatHistory/seed-proj-001/seed-user-001");
  return Array.isArray(response.data) ? response.data : [];
}

async function sendUserMessage(userMessage: string): Promise<Message> {
  const response = await apiClient.post("ai/chat", {
    userMessage: userMessage,
    userId:"seed-user-001", 
    projectId: 'seed-proj-001',
    companyId: 'seed-company-001',
    role: 'user',
  });
  console.log(response.data)
  return response.data;
}

export { getChatHistory, sendUserMessage };