import { Controller, Get, Param, Query, ParseIntPipe } from '@nestjs/common';
import { ProjectsService } from '@/modules/projects/projects.service';

@Controller(':companyId/projects')
export class ProjectsController {
  constructor(private readonly projectService: ProjectsService) {}

  @Get('')
  async getListOfProjects(
    @Param('companyId') companyId: string,
    @Query('userId') userId: string,
    @Query('term') term: string,
    @Query('page', ParseIntPipe) page: number,
    @Query('limit', ParseIntPipe) limit: number,
  ) {
    return this.projectService.getListOfProjects({
      companyId: companyId,
      userId: userId,
      term: term,
      page: page,
      limit: limit,
    });
  }
}