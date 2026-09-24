import { Injectable } from '@nestjs/common';
import { ProjectsRepository } from '@/modules/projects/projects.repository';

@Injectable()
export class ProjectsService {
  constructor(private readonly projectRepository: ProjectsRepository) {}

  async getListOfProjects(request: {
    companyId: string;
    userId: string;
    term?: string;
    page: number;
    limit: number;
  }) {
    return await this.projectRepository.getListOfProjects(request);
  }
}