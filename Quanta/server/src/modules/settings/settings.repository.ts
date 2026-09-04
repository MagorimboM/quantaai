import { Injectable } from '@nestjs/common';
import { prisma } from '@/core/database/postgres';
import { NotFoundException } from '@nestjs/common';
import type {
  CompanyInformationRequest,
  TeamMemberRequest,
  GetCompanyTeamRequest,
  GetCompanyInformationRequest,
} from '@/modules/settings/contracts/settings.requests.contracts';

@Injectable()
export class SettingsRepository {
  async getCompanyInformation(request: GetCompanyInformationRequest) {
    const company = await prisma.company.findUnique({
      where: { id: request.companyId, isArchived: false },
    });

    if (company == null) {
      throw new NotFoundException('Company does not exist');
    }

    return company;
  }

  async getCompanyTeam(request: GetCompanyTeamRequest) {
    return await prisma.companyTeamMembers.findMany({
      where: { companyId: request.companyId },
    });
  }

  async getCompanyComplianceAndStandardDocuments(request: {
    companyId: string;
  }) {
    return await prisma.document.findMany({
      where: { companyId: request.companyId },
    });
  }

  async updateCompanyProfile(request: CompanyInformationRequest) {
    return await prisma.company.update({
      where: { id: request.companyId },
      data: {
        name: request.companyName,
        address: `${request.companyAddress.houseNumber}, ${request.companyAddress.street}, ${request.companyAddress.city}, ${request.companyAddress.state}, ${request.companyAddress.postCode}`,
      },
    });
  }

  async updateCompanyTeam(request: TeamMemberRequest) {
    return await prisma.companyTeamMembers.update({
      where: { id: request.id },
      data: {
        name: request.name,
        lastName: request.lastName,
        email: request.email,
        phoneNumber: request.phoneNumber,
        position: request.position,
      },
    });
  }

  async deleteCompanyTeamMember(request: TeamMemberRequest) {
    return await prisma.companyTeamMembers.delete({
      where: {
        id: request.id,
      },
    });
  }
}
