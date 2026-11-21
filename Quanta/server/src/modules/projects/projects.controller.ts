import { Controller, Get, Param, Query, Body, Post } from '@nestjs/common';
import { ProjectsService } from '@/modules/projects/projects.service';
import { ClerkUserId } from '@/auth/services/currentUser.guard';
import { ZodValidationPipe } from '@/common/validations/global.input.validator'
import {
  createNewProjectSchema,
  getListOfProjectsQuerySchema,
} from '@/modules/projects/contracts/projects.schema';
import type { GetListOfProjectsResponse } from '@/modules/projects/contracts/projects.response.contracts';
import type {
  CreateNewProjectRequest,
  GetListOfProjectsQuery,
} from '@/modules/projects/contracts/projects.request.contracts';

// Every route runs behind the global ClerkAuthGuard, so @ClerkUserId() is the
// verified caller. The user is never read from the URL: the service works out
// who is asking and checks the company in the URL really is theirs.
//
// The query and body are checked and tidied by the schemas in
// projects.schema.ts first: a bad one gets a 400 and never reaches the service.
@Controller(':companyId/projects')
export class ProjectsController {
  constructor(private readonly projectService: ProjectsService) {}

  // One page of the caller's projects in this company, most recently updated
  // first. `term` filters by project name or description.
  //   ?term=smith&page=1&limit=10
  @Get()
  async getListOfProjects(
    @ClerkUserId() clerkId: string,
    @Param('companyId') companyId: string,
    @Query(new ZodValidationPipe(getListOfProjectsQuerySchema))
    query: GetListOfProjectsQuery,
  ): Promise<GetListOfProjectsResponse> {
    return this.projectService.getListOfProjects({
      clerkId,
      companyId,
      term: query.term,
      page: query.page,
      limit: query.limit,
    });
  }

  // Creates a project in this company
  @Post('new-project')
  async createNewProject(
    @ClerkUserId() clerkId: string,
    @Param('companyId') companyId: string,
    @Body(new ZodValidationPipe(createNewProjectSchema))
    request: CreateNewProjectRequest,
  ) {
    return await this.projectService.createNewProject(clerkId, companyId, request);
  }
}