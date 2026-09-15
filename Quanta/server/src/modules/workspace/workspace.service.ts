import { Injectable } from '@nestjs/common';
import { WorkspaceRepository } from '@/modules/workspace/workspace.repository';

@Injectable()
export class WorkspaceService {
  constructor(private readonly workspaceRepository: WorkspaceRepository) {}
  async getWorkspaces(request: { userId: string }) {
    return await this.workspaceRepository.getWorkspaces(request);
  }

  async getPersonalWorkspace(request: { userId: string }) {
    return await this.workspaceRepository.getPersonalWorkspace(request);
  }; 

  async createNewWorkspace(request: any) {
    // take in the new company workspace details
  }
}
