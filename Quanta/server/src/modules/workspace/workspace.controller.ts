import {
  Controller,
  Get,
  Post,
  Body,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { WorkspaceService } from '@/modules/workspace/workspace.service';
import { ClerkUserId } from '@/auth/services/currentUser.guard';
import { ZodValidationPipe } from '@/common/validations/global.input.validator';
import {
  createWorkspaceSchema,
  companyPolicyFileSchema,
  MAX_POLICY_BYTES,
  type CreateWorkspaceRequest,
  type CompanyPolicyFile,
} from '@/modules/workspace/contracts/workspace.schema';
import type {
  CompanyWorkspace,
  PersonalWorkspace,
  DueProject,
} from '@/modules/workspace/contracts/workspace.response.contracts';

// The workspace switcher: what the signed-in person can open. Every route runs
// behind the global ClerkAuthGuard, so @ClerkUserId() is the verified caller.
// The user is never read from the URL or the body.
@Controller('workspaces')
export class WorkspaceController {
  constructor(private readonly workspaceService: WorkspaceService) {}

  // The person's company workspaces
  @Get()
  async getWorkspaces(
    @ClerkUserId() clerkId: string,
  ): Promise<CompanyWorkspace[]> {
    return await this.workspaceService.getWorkspaces(clerkId);
  }

  // The person's own workspace, or nothing if they don't have one
  @Get('personal')
  async getPersonalWorkspace(
    @ClerkUserId() clerkId: string,
  ): Promise<PersonalWorkspace | null> {
    return await this.workspaceService.getPersonalWorkspace(clerkId);
  }

  // Unfinished projects with a due date, across all the person's companies
  @Get('due-projects')
  async getWorkspaceProjects(
    @ClerkUserId() clerkId: string,
  ): Promise<DueProject[]> {
    return await this.workspaceService.getWorkspaceProjects(clerkId);
  }

  // Creates a company and its workspace. The request is multipart form data:
  // the text fields, plus an optional policy PDF in the "file" field.
  //
  // Both are checked before the service runs (see workspace.schema.ts): the
  // fields by createWorkspaceSchema, and the file by companyPolicyFileSchema
  // (a real PDF, 10 MB at most). Anything wrong gets a 400. Multer's own limit
  // turns away a file over 10 MB with a 413 before it is even read in.
  @Post('create')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: MAX_POLICY_BYTES, files: 1 },
    }),
  )
  async createNewWorkspace(
    @ClerkUserId() clerkId: string,
    @Body(new ZodValidationPipe(createWorkspaceSchema))
    body: CreateWorkspaceRequest,
    @UploadedFile(new ZodValidationPipe(companyPolicyFileSchema))
    file: CompanyPolicyFile,
  ): Promise<CompanyWorkspace> {
    return await this.workspaceService.createNewWorkspace(clerkId, body, file);
  }
}