import { Injectable } from '@nestjs/common';
import { ProjectsRepository } from '@/modules/projects/projects.repository';

@Injectable()
export class ProjectsService {
  constructor(private readonly projectRepository: ProjectsRepository) {}
  async getListOfProjects(request: { companyId: string }) {
    return await this.projectRepository.getListOfProjects({
      companyId: request.companyId,
    });
  }
}
