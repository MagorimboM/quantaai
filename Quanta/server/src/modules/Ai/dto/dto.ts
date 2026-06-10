import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

// DTO for sending a message to the AI chat
// sessionId links the message to an existing conversation
// companyId and projectId scope the AI context
export class ChatDto {
  @IsString()
  @IsNotEmpty()
  userMessage!: string;

  @IsString()
  @IsOptional()
  projectId!: string;

  @IsString()
  @IsOptional()
  companyId!: string;

  @IsString()
  @IsOptional()
  role!: "user"|"ai";
}

export class GetChatHistory {
  @IsString()
  userPrompt!: string;
  @IsString()
  @IsOptional()
  projectId!: string;
}
