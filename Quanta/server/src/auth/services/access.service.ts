import { Injectable, NotFoundException } from '@nestjs/common';
import { createClerkClient } from '@clerk/backend';
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

  // Requests for the same new person that arrive together (the workspace
  // switcher sends three at once) share one creation, so the row is only created once.
  private creatingUsers = new Map<string, Promise<string>>();

  // Turns the verified Clerk id into our own users.id. A person who signs up
  // normally gets their row from Clerk's webhook, but that can arrive late, or
  // never (Clerk can't reach a local development server). So when there is no
  // row yet, it is created here, from Clerk, on their first request.
  async getUserId(clerkId: string): Promise<string> {
    const existing = await this.authRepository.findByClerkId(clerkId);
    if (existing) return existing.id;

    let pending = this.creatingUsers.get(clerkId);
    if (!pending) {
      pending = this.createUserFromClerk(clerkId).finally(() =>
        this.creatingUsers.delete(clerkId),
      );
      this.creatingUsers.set(clerkId, pending);
    }
    return await pending;
  }

  // Reads the person's name and email from Clerk and stores them.
  // If we already hold a user with the same VERIFIED email under another Clerk
  // id (they re-created their account, or moved to a new Clerk app), that user
  // is kept and pointed at the new id, so their companies and recipes follow them.
  private async createUserFromClerk(clerkId: string): Promise<string> {
    const secretKey = process.env.CLERK_SECRET_KEY;
    if (!secretKey) {
      throw new Error('Missing CLERK_SECRET_KEY in environment');
    }

    const clerkUser = await createClerkClient({ secretKey }).users.getUser(
      clerkId,
    );
    const primaryEmail =
      clerkUser.emailAddresses.find(
        (email) => email.id === clerkUser.primaryEmailAddressId,
      ) ?? clerkUser.emailAddresses[0];
    const email = primaryEmail?.emailAddress ?? '';

    if (email && primaryEmail?.verification?.status === 'verified') {
      const relinked = await this.authRepository.relinkUserByEmail(
        clerkId,
        email,
      );
      if (relinked) return relinked.id;
    }

    const created = await this.authRepository.upsertUserFromClerk(clerkId, {
      email,
      firstName: clerkUser.firstName ?? '',
      lastName: clerkUser.lastName ?? '',
    });
    return created.id;
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