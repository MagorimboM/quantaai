/* ============================================================================
 * 1. PROJECTS LANDING & OVERVIEW
 * ============================================================================
 *
 * GET /:companyId/projects
 * - Description: Get list of existing projects for the landing page.
 * - Query Params: None
 * - Body: None
 * - Returns: Array of project summary objects
 */

import { Controller, Get, Param } from '@nestjs/common';
import { ProjectsService } from '@/modules/projects/projects.service';

@Controller(':companyId/projects')
export class ProjectsController {
  constructor(private readonly projectService: ProjectsService) {}
  @Get('/')
  async getListOfProjects(@Param(':companyId') companyId: string) {}
}
