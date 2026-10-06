import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

// Body of POST /:companyId/assistant/chat.
//
// Deliberately NOT accepted from the client:
//  - userId: taken from the verified Clerk token, so nobody can chat as someone else
//  - companyId: taken from the URL, so there is one source of truth
//  - role: a question is always saved as "user"; the client can't write
//    "assistant" messages into the history the model later reads
export class SendMessageRequest {
  // Capped because every question is sent to a paid model
  @IsString()
  @IsNotEmpty()
  @MaxLength(4000)
  userMessage!: string;

  // Set when the user is inside a project: the assistant then also reads that
  // project's documents and keeps a separate conversation for it
  @IsString()
  @IsOptional()
  projectId?: string;
}