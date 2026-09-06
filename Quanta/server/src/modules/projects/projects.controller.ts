import { Controller, Get, Param } from '@nestjs/common';
import { ProjectsService } from '@/modules/projects/projects.service';

@Controller(':companyId/projects')
export class ProjectsController {
  constructor(private readonly projectService: ProjectsService) {}
  @Get('')
  async getListOfProjects(@Param(':companyId') companyId: string) {
    return this.projectService.getListOfProjects({ companyId: companyId });
  }
}
