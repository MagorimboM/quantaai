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

  async createNewWorkspace(request: {
      name: string;
      address: string;
      city: string;
      state: string;
      postcode: string;
      country: 'Australia';
      phone: string;
      email: string;
      contactName: string;
      contactPhone: string;
      contactEmail: string;
      companyType: string;
    }) {
     return await this.workspaceRepository.createNewWorkspace(request)
  }
}
