import { Controller, Get, Post, Body } from '@nestjs/common';
import { WorkspaceService } from '@/modules/workspace/workspace.service';
import { ClerkUserId } from '@/auth/services/currentUser.guard';
import type { CreateWorkspaceRequest } from '@/modules/workspace/contracts/workspace.request.contracts';
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

  // Creates a company and its workspace
  @Post('create')
  async createNewWorkspace(
    @ClerkUserId() clerkId: string,
    @Body() body: CreateWorkspaceRequest,
  ): Promise<CompanyWorkspace> {
    return await this.workspaceService.createNewWorkspace(clerkId, body);
  }
}