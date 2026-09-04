import { Injectable } from '@nestjs/common';
import { prisma } from '@/core/database/postgres';
import { NotFoundException } from '@nestjs/common';

type Address = {
  state: string;
  city: string;
  postCode: string;
  street: string;
  houseNumber: number | null;
};

type CompanyInformation = {
  companyId: string;
  companyName: string;
  companyAddress: Address;
};

type TeamMember = {
  id: string;
  name: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  position: string;
};

type Documents = {
  documentId: string;
  documentName: string;
  documentType: string;
};

@Injectable()
export class SettingsRepository {
  async getCompanyInformation(request: { companyId: string }) {
    const company = await prisma.company.findUnique({
      where: { id: request.companyId, isArchived: false },
    });

    if (company == null) {
      throw new NotFoundException('Company does not exist');
    }

    return company;
  }

  async getCompanyTeam(request: { companyId: string }) {
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

  async updateCompanyProfile(request: CompanyInformation) {
    return await prisma.company.update({
      where: { id: request.companyId },
      data: {
        name: request.companyName,
        address: `${request.companyAddress.houseNumber}, ${request.companyAddress.street}, ${request.companyAddress.city}, ${request.companyAddress.state}, ${request.companyAddress.postCode}`,
      },
    });
  }

  async updateCompanyTeam(request: TeamMember) {
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

  async deleteCompanyTeamMember(request: TeamMember) {
    return await prisma.companyTeamMembers.delete({
      where: {
        id: request.id,
      },
    });
  }
}
