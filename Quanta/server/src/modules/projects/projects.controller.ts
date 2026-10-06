import {
  Controller,
  Get,
  Param,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { ProjectsService } from '@/modules/projects/projects.service';
import { ClerkUserId } from '@/auth/services/currentUser.guard';
import type { GetListOfProjectsResponse } from '@/modules/projects/contracts/projects.response.contracts';

// Every route runs behind the global ClerkAuthGuard, so @ClerkUserId() is the
// verified caller. The user is never read from the URL: the service works out
// who is asking and checks the company in the URL really is theirs.
@Controller(':companyId/projects')
export class ProjectsController {
  constructor(private readonly projectService: ProjectsService) {}

  // One page of the caller's projects in this company, most recently updated
  // first. `term` filters by project name or description.
  @Get()
  async getListOfProjects(
    @ClerkUserId() clerkId: string,
    @Param('companyId') companyId: string,
    @Query('term') term?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit?: number,
  ): Promise<GetListOfProjectsResponse> {
    return this.projectService.getListOfProjects({
      clerkId,
      companyId,
      term,
      page: page ?? 1,
      limit: limit ?? 10,
    });
  }
}