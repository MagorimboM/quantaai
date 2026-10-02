import { Injectable } from '@nestjs/common';
import { prisma } from '@/core/database/postgres';

@Injectable()
export class AuthRepository {
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
}