import { Injectable } from '@nestjs/common';
import { prisma } from '@/core/database/postgres';

// Clerk owns identity (passwords, sessions). The users table keeps a local
// copy keyed by clerkId, so every other table can point at our own users.id.
@Injectable()
export class AuthRepository {
  // Called from the Clerk webhook when someone signs up or edits their profile.
  // An upsert, because the webhook can be delivered more than once.
  async upsertUserFromClerk(
    clerkId: string,
    data: { email: string; firstName: string; lastName: string },
  ) {
    return prisma.user.upsert({
      where: { clerkId },
      update: {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
      },
      create: {
        clerkId,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
      },
    });
  }

  async findByClerkId(clerkId: string) {
    return prisma.user.findUnique({ where: { clerkId } });
  }

  // True only if the company was created by this user
  async companyBelongsToUser(
    userId: string,
    companyId: string,
  ): Promise<boolean> {
    const company = await prisma.company.findFirst({
      where: { id: companyId, userId },
      select: { id: true },
    });
    return company !== null;
  }

  // True only if the project was created by this user and belongs to the company
  async projectBelongsToUser(
    userId: string,
    companyId: string,
    projectId: string,
  ): Promise<boolean> {
    const project = await prisma.project.findFirst({
      where: { id: projectId, companyId, userId },
      select: { id: true },
    });
    return project !== null;
  }
}