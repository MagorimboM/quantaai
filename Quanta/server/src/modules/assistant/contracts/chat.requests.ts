import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

// DTO for sending a message to the AI chat
// sessionId links the message to an existing conversation
// companyId and projectId scope the AI context
export class SendMessageRequest {
  @IsString()
  @IsNotEmpty()
  userMessage!: string;

  @IsString()
  @IsNotEmpty()
  userId!:string

  @IsString()
  @IsOptional()
  projectId!: string;

  @IsString()
  @IsOptional()
  companyId!: string;

  @IsString()
  @IsOptional()
  role!: "user"|"assistant";
}

export class GetChatHistoryRequest {
  @IsString()
  userId!: string;
  @IsString()
  @IsOptional()
  projectId!: string;
}
