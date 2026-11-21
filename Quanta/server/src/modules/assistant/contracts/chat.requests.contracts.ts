import type { z } from 'zod';
import type {
  chatHistoryQuerySchema,
  sendMessageSchema,
} from '@/modules/assistant/contracts/assistant.schema';

// The body and query the routes accept come from the Zod schemas in
// assistant.schema.ts, so the rules and the types can't drift apart. Each is
// what the route receives once ZodValidationPipe has checked it.

// Body of POST /:companyId/assistant/chat: the question (trimmed, at most 4000
// characters) and, inside a project, the project's id. See the schema for what
// is deliberately not accepted from the client.
export type SendMessageRequest = z.output<typeof sendMessageSchema>;

// Query of GET /:companyId/assistant/chatHistory
export type ChatHistoryQuery = z.output<typeof chatHistoryQuerySchema>;