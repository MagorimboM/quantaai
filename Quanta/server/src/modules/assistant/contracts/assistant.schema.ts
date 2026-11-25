import { z } from 'zod';
import { optionalQueryText } from '@/common/validations/global.input.fields';

// The rules for the assistant's routes, checked by ZodValidationPipe before each
// route runs. A bad body or query gets a 400 and never reaches the service.

// The longest question one message may hold. Capped because every question is
// sent to a paid model.
export const MAX_MESSAGE_LENGTH = 4000;

// POST /:companyId/assistant/chat   { userMessage, projectId? }
//
// Deliberately NOT accepted from the client (Zod drops any other field):
//  - userId: taken from the verified Clerk token, so nobody can chat as someone else
//  - companyId: taken from the URL, so there is one source of truth
//  - role: a question is always saved as "user"; the client can't write
//    "assistant" messages into the history the model later reads
export const sendMessageSchema = z.object({
  // Trimmed at the ends only: its line breaks and spacing are kept, because a
  // question can be a pasted list or several paragraphs
  userMessage: z
    .string({ error: 'Type a question for the assistant.' })
    .trim()
    .min(1, 'Type a question for the assistant.')
    .max(
      MAX_MESSAGE_LENGTH,
      `Keep the question to ${MAX_MESSAGE_LENGTH} characters or fewer.`,
    ),

  // Set when the user is inside a project: the assistant then also reads that
  // project's documents and keeps a separate conversation for it. Undefined
  // when missing or blank.
  projectId: z
    .string({ error: 'Need a project Id, create project first' })
    .trim(),
});

// GET /:companyId/assistant/chatHistory?projectId=...
// Without a project, the company-level conversation.
export const chatHistoryQuerySchema = z.object({
  projectId: z
    .string({ error: 'Need a project Id, create project first' })
    .trim(),
});
