import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SettingsRepository } from '@/modules/settings/settings.repository';
import { AccessService } from '@/auth/services/access.service';
import type {
  UpdateCompanyProfileRequest,
  AddTeamMemberRequest,
} from '@/modules/settings/contracts/settings.requests.contracts';
import type {
  CompanyProfileDetails,
  TeamMember,
  DeleteTeamMemberResponse,
  StandardDocument,
} from '@/modules/settings/contracts/settings.response.contracts';

const LOOKS_LIKE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// A blank optional detail is stored as null rather than as empty text
function orNull(value: string | undefined): string | null {
  return value?.trim() || null;
}

// Every method first checks the company really belongs to the caller. The
// company id comes from the URL, so on its own it proves nothing.
@Injectable()
export class SettingsService {
  constructor(
    private readonly settingsRepository: SettingsRepository,
    private readonly accessService: AccessService,
  ) {}

  async getCompanyProfile(request: {
    clerkId: string;
    companyId: string;
  }): Promise<CompanyProfileDetails> {
    const userId = await this.accessService.requireCompanyAccess(
      request.clerkId,
      request.companyId,
    );
    const profile = await this.settingsRepository.getCompanyProfile(
      request.companyId,
      userId,
    );
    if (!profile) throw new NotFoundException('Company not found');
    return profile;
  }

  // Saves the edited company details. The company needs a name that none of the
  // caller's other companies uses, and any email given must look like one.
  async updateCompanyProfile(request: {
    clerkId: string;
    companyId: string;
    body: UpdateCompanyProfileRequest;
  }): Promise<CompanyProfileDetails> {
    const userId = await this.accessService.requireCompanyAccess(
      request.clerkId,
      request.companyId,
    );
    const { body } = request;

    const name = body.name?.trim();
    if (!name) throw new BadRequestException('The company needs a name');

    for (const email of [body.email, body.contactEmail]) {
      if (email?.trim() && !LOOKS_LIKE_EMAIL.test(email.trim())) {
        throw new BadRequestException(`"${email.trim()}" is not a valid email`);
      }
    }

    if (
      await this.settingsRepository.companyNameTaken(
        userId,
        name,
        request.companyId,
      )
    ) {
      throw new ConflictException('You already have a company with this name');
    }

    return await this.settingsRepository.updateCompanyProfile(
      request.companyId,
      userId,
      {
        name,
        companyType: orNull(body.companyType),
        address: orNull(body.address),
        city: orNull(body.city),
        state: orNull(body.state),
        postcode: orNull(body.postcode),
        country: orNull(body.country),
        phone: orNull(body.phone),
        email: orNull(body.email),
        contactName: orNull(body.contactName),
        contactPhone: orNull(body.contactPhone),
        contactEmail: orNull(body.contactEmail),
      },
    );
  }

  async getCompanyTeam(request: {
    clerkId: string;
    companyId: string;
  }): Promise<TeamMember[]> {
    const userId = await this.accessService.requireCompanyAccess(
      request.clerkId,
      request.companyId,
    );
    return await this.settingsRepository.getCompanyTeam(
      request.companyId,
      userId,
    );
  }

  // Adds a person to the team. They need a first and last name and an email
  // that looks like one and isn't already on this company's team.
  async addTeamMember(request: {
    clerkId: string;
    companyId: string;
    body: AddTeamMemberRequest;
  }): Promise<TeamMember> {
    const userId = await this.accessService.requireCompanyAccess(
      request.clerkId,
      request.companyId,
    );
    const { body } = request;

    const name = body.name?.trim();
    const lastName = body.lastName?.trim();
    const email = body.email?.trim();
    if (!name || !lastName) {
      throw new BadRequestException('Enter the first and last name');
    }
    if (!email || !LOOKS_LIKE_EMAIL.test(email)) {
      throw new BadRequestException('Enter a valid email address');
    }

    if (
      await this.settingsRepository.teamMemberEmailExists(
        request.companyId,
        userId,
        email,
      )
    ) {
      throw new ConflictException('Someone on the team already has this email');
    }

    return await this.settingsRepository.addTeamMember(
      request.companyId,
      userId,
      {
        name,
        lastName,
        email,
        phoneNumber: body.phoneNumber?.trim() ?? '',
        position: body.position?.trim() ?? '',
      },
    );
  }

  async deleteTeamMember(request: {
    clerkId: string;
    companyId: string;
    memberId: string;
  }): Promise<DeleteTeamMemberResponse> {
    const userId = await this.accessService.requireCompanyAccess(
      request.clerkId,
      request.companyId,
    );
    const deleted = await this.settingsRepository.deleteTeamMember(
      request.companyId,
      userId,
      request.memberId,
    );
    if (!deleted) throw new NotFoundException('Team member not found');

    return { success: true, deletedMemberId: request.memberId };
  }

  async getStandardsDocuments(request: {
    clerkId: string;
    companyId: string;
  }): Promise<StandardDocument[]> {
    const userId = await this.accessService.requireCompanyAccess(
      request.clerkId,
      request.companyId,
    );
    return await this.settingsRepository.getStandardsDocuments(
      request.companyId,
      userId,
    );
  }
}