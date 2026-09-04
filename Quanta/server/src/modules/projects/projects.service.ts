import { Injectable } from '@nestjs/common';
import { ProjectsRepository } from '@/modules/projects/projects.repository';

@Injectable()
export class ProjectsService {
  constructor(private readonly projectRepository: ProjectsRepository) {}
  async getListOfProjects(companyId: string) {}
}; 
