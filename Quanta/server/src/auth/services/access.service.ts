import { Injectable, NotFoundException } from '@nestjs/common';
import { AuthRepository } from '@/auth/auth.repository';

// The two checks every company-scoped route needs before touching data.
//
// Clerk tells us WHO is calling (the verified token). The company id in the
// URL is only a claim, so it has to be checked against that person.
// OWNERSHIP MODEL: a company belongs to the user who created it, and every
// project, recipe and document under it belongs to that same user.
//
// "Not found" is used for every failure so a response never confirms whether
// someone else's company exists.
@Injectable()
export class AccessService {
  constructor(private readonly authRepository: AuthRepository) {}

  // Turns the verified Clerk id into our own users.id
  async getUserId(clerkId: string): Promise<string> {
    const user = await this.authRepository.findByClerkId(clerkId);
    if (!user) {
      throw new NotFoundException('No local user found for this account');
    }
    return user.id;
  }

  // Resolves the caller and checks the company is theirs. Returns users.id.
  async requireCompanyAccess(
    clerkId: string,
    companyId: string,
  ): Promise<string> {
    const userId = await this.getUserId(clerkId);

    const owned = await this.authRepository.companyBelongsToUser(
      userId,
      companyId,
    );
    if (!owned) {
      throw new NotFoundException('Company not found');
    }

    return userId;
  }

  // Resolves the caller, checks the company is theirs, and checks the project
  // is theirs and sits inside that company. Returns users.id.
  async requireProjectAccess(
    clerkId: string,
    companyId: string,
    projectId: string,
  ): Promise<string> {
    const userId = await this.requireCompanyAccess(clerkId, companyId);

    const owned = await this.authRepository.projectBelongsToUser(
      userId,
      companyId,
      projectId,
    );
    if (!owned) {
      throw new NotFoundException('Project not found');
    }

    return userId;
  }
}