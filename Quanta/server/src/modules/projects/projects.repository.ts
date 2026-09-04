
import { Controller, Get, Param } from '@nestjs/common';

@Controller(':companyId/projects')
export class ProjectsRepository {
  @Get('/')
  async getListOfProjects(@Param(':companyId') companyId: string) {

    

  }}