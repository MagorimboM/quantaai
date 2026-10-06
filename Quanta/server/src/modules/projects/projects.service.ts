import { Injectable } from '@nestjs/common';
import { ProjectsRepository } from '@/modules/projects/projects.repository';
import { AccessService } from '@/auth/services/access.service';
import type { GetListOfProjectsResponse } from '@/modules/projects/contracts/projects.response.contracts';

// The most projects one request may return, however large a limit is asked for
const MAX_PAGE_SIZE = 50;

@Injectable()
export class ProjectsService {
  constructor(
    private readonly projectRepository: ProjectsRepository,
    private readonly accessService: AccessService,
  ) {}

  // Checks the company really belongs to the caller, then returns one page of
  // their projects in it.
  async getListOfProjects(request: {
    clerkId: string;
    companyId: string;
    term?: string;
    page: number;
    limit: number;
  }): Promise<GetListOfProjectsResponse> {
    const userId = await this.accessService.requireCompanyAccess(
      request.clerkId,
      request.companyId,
    );

    // Keep paging in a safe range: a page below 1 would ask the database to skip
    // a negative number of rows (an error), and a huge limit would return
    // everything in one go.
    const page = Math.max(request.page, 1);
    const limit = Math.min(Math.max(request.limit, 1), MAX_PAGE_SIZE);

    return await this.projectRepository.getListOfProjects({
      companyId: request.companyId,
      userId,
      term: request.term?.trim() || undefined,
      page,
      limit,
    });
  }
}