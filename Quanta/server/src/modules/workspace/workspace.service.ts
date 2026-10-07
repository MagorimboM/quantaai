import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { WorkspaceRepository } from '@/modules/workspace/workspace.repository';
import { AccessService } from '@/auth/services/access.service';
import type { CreateWorkspaceRequest } from '@/modules/workspace/contracts/workspace.request.contracts';
import type {
  CompanyWorkspace,
  PersonalWorkspace,
  DueProject,
} from '@/modules/workspace/contracts/workspace.response.contracts';

const LOOKS_LIKE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// A detail left blank is stored as empty rather than as blank text
function orNull(value: string | undefined): string | null {
  return value?.trim() || null;
}

// These routes list what belongs to the signed-in person, so there is no company
// to check: the person is identified from their Clerk token alone, and every
// query is limited to their own data.
@Injectable()
export class WorkspaceService {
  constructor(
    private readonly workspaceRepository: WorkspaceRepository,
    private readonly accessService: AccessService,
  ) {}

  async getWorkspaces(clerkId: string): Promise<CompanyWorkspace[]> {
    const userId = await this.accessService.getUserId(clerkId);
    return await this.workspaceRepository.getCompanyWorkspaces(userId);
  }

  async getPersonalWorkspace(
    clerkId: string,
  ): Promise<PersonalWorkspace | null> {
    const userId = await this.accessService.getUserId(clerkId);
    return await this.workspaceRepository.getPersonalWorkspace(userId);
  }

  async getWorkspaceProjects(clerkId: string): Promise<DueProject[]> {
    const userId = await this.accessService.getUserId(clerkId);
    return await this.workspaceRepository.getDueProjects(userId);
  }

  // Creates a company and the workspace that opens it. The company needs a name
  // the person doesn't already use (ignoring case), and any email given must
  // look like one.
  async createNewWorkspace(
    clerkId: string,
    body: CreateWorkspaceRequest,
  ): Promise<CompanyWorkspace> {
    const userId = await this.accessService.getUserId(clerkId);

    const name = body.name?.trim();
    if (!name) throw new BadRequestException('The company needs a name');

    for (const email of [body.email, body.contactEmail]) {
      if (email?.trim() && !LOOKS_LIKE_EMAIL.test(email.trim())) {
        throw new BadRequestException(`"${email.trim()}" is not a valid email`);
      }
    }

    if (await this.workspaceRepository.companyNameTaken(userId, name)) {
      throw new ConflictException('You already have a company with this name');
    }

    return await this.workspaceRepository.createCompanyWorkspace({
      userId,
      name,
      address: orNull(body.address),
      city: orNull(body.city),
      state: orNull(body.state),
      postcode: orNull(body.postcode),
      country: body.country?.trim() || 'Australia',
      phone: orNull(body.phone),
      email: orNull(body.email),
      contactName: orNull(body.contactName),
      contactPhone: orNull(body.contactPhone),
      contactEmail: orNull(body.contactEmail),
      companyType: orNull(body.companyType),
    });
  }
}