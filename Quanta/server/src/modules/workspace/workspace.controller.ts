import { Controller, Get, Post, Body } from '@nestjs/common';
import { WorkspaceService } from '@/modules/workspace/workspace.service';

@Controller('workspaces')
export class WorkspaceController {
  constructor(private readonly workspaceService: WorkspaceService) {}

  @Get('/')
  async getWorkspaces() {
    // TODO :: fetch the userId from the headers of the request
    const userId = 'seed-user-001';
    return await this.workspaceService.getWorkspaces({ userId: userId });
  }; 

  @Get('/personal')
  async getPersonalWorkspace() {
    const userId = 'seed-user-001';
    return await this.workspaceService.getPersonalWorkspace({ userId: userId });
  }
  @Post('create')
  async createNewWorkspace(
    @Body()
    request: {
      name: string;
      address: string;
      city: string;
      state: string;
      postcode: string;
      country: 'Australia';
      phone: string;
      email: string;
      contactName: string;
      contactPhone: string;
      contactEmail: string;
      companyType: string;
    },
  ) {
    return await this.workspaceService.createNewWorkspace(request);
  }
}
