import { Injectable } from '@nestjs/common';
import { prisma } from '@/core/database/postgres';
import type {
  CompanyProfileRecord,
  TeamMemberRecord,
} from '@/modules/settings/contracts/settings.requests.contracts';
import type {
  CompanyProfileDetails,
  TeamMember,
  StandardDocument,
} from '@/modules/settings/contracts/settings.response.contracts';

const PROFILE_SELECT = {
  id: true,
  name: true,
  companyType: true,
  address: true,
  city: true,
  state: true,
  postcode: true,
  country: true,
  phone: true,
  email: true,
  contactName: true,
  contactPhone: true,
  contactEmail: true,
};

const TEAM_MEMBER_SELECT = {
  id: true,
  name: true,
  lastName: true,
  email: true,
  phoneNumber: true,
  position: true,
};

type ProfileRow = {
  id: string;
  name: string;
  companyType: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  postcode: string | null;
  country: string | null;
  phone: string | null;
  email: string | null;
  contactName: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
};

// The screen edits plain text, so details never filled in become empty text
function toProfile(row: ProfileRow): CompanyProfileDetails {
  return {
    id: row.id,
    name: row.name,
    companyType: row.companyType ?? '',
    address: row.address ?? '',
    city: row.city ?? '',
    state: row.state ?? '',
    postcode: row.postcode ?? '',
    country: row.country ?? '',
    phone: row.phone ?? '',
    email: row.email ?? '',
    contactName: row.contactName ?? '',
    contactPhone: row.contactPhone ?? '',
    contactEmail: row.contactEmail ?? '',
  };
}

// OWNERSHIP MODEL: userId owns all data; companyId is a tag on it. Every query
// is filtered by both, so settings only ever read and change the caller's own
// company, team and documents.
@Injectable()
export class SettingsRepository {
  // The company, or null if it isn't the caller's (or has been archived)
  async getCompanyProfile(
    companyId: string,
    userId: string,
  ): Promise<CompanyProfileDetails | null> {
    const company = await prisma.company.findFirst({
      where: { id: companyId, userId, isArchived: false },
      select: PROFILE_SELECT,
    });
    return company ? toProfile(company) : null;
  }

  // True if another of the caller's companies already uses this name (ignoring
  // case). A name identifies a company in the workspace list, so two can't share one.
  async companyNameTaken(
    userId: string,
    name: string,
    excludeCompanyId: string,
  ): Promise<boolean> {
    const count = await prisma.company.count({
      where: {
        userId,
        name: { equals: name, mode: 'insensitive' },
        NOT: { id: excludeCompanyId },
      },
    });
    return count > 0;
  }

  async updateCompanyProfile(
    companyId: string,
    userId: string,
    record: CompanyProfileRecord,
  ): Promise<CompanyProfileDetails> {
    const company = await prisma.company.update({
      where: { id: companyId, userId },
      data: record,
      select: PROFILE_SELECT,
    });
    return toProfile(company);
  }

  // The company's team, alphabetical by last name
  async getCompanyTeam(companyId: string, userId: string): Promise<TeamMember[]> {
    return await prisma.companyTeamMembers.findMany({
      where: { companyId, userId },
      orderBy: [{ lastName: 'asc' }, { name: 'asc' }],
      select: TEAM_MEMBER_SELECT,
    });
  }

  // True if someone on this company's team already has this email (ignoring case)
  async teamMemberEmailExists(
    companyId: string,
    userId: string,
    email: string,
  ): Promise<boolean> {
    const count = await prisma.companyTeamMembers.count({
      where: {
        companyId,
        userId,
        email: { equals: email, mode: 'insensitive' },
      },
    });
    return count > 0;
  }

  async addTeamMember(
    companyId: string,
    userId: string,
    record: TeamMemberRecord,
  ): Promise<TeamMember> {
    return await prisma.companyTeamMembers.create({
      data: { companyId, userId, ...record },
      select: TEAM_MEMBER_SELECT,
    });
  }

  // Removes the member. Returns false if they aren't on the caller's team.
  async deleteTeamMember(
    companyId: string,
    userId: string,
    memberId: string,
  ): Promise<boolean> {
    const result = await prisma.companyTeamMembers.deleteMany({
      where: { id: memberId, companyId, userId },
    });
    return result.count > 0;
  }

  // The company-level documents (standards, policies, certifications): the ones
  // uploaded for the company itself, not for one of its projects, and not
  // archived. Only what the list shows is read: never the file's location or
  // its full extracted text.
  async getStandardsDocuments(
    companyId: string,
    userId: string,
  ): Promise<StandardDocument[]> {
    return await prisma.document.findMany({
      where: {
        companyId,
        userId,
        projectId: null,
        documentType: 'companyDocument',
        isArchived: false,
      },
      orderBy: { uploadedAt: 'desc' },
      select: { id: true, name: true, documentType: true, uploadedAt: true },
    });
  }
}