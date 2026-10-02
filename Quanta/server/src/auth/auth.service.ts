import { BadRequestException, Injectable } from '@nestjs/common';
import { Webhook } from 'svix';
import { AuthRepository } from './auth.repository';

@Injectable()
export class AuthService {
  constructor(private readonly authRepository: AuthRepository) {}

  async handleClerkWebhook(
    rawBody: Buffer,
    headers: {
      'svix-id': string;
      'svix-timestamp': string;
      'svix-signature': string;
    },
  ) {
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new Error('Missing CLERK_WEBHOOK_SECRET in environment');
    }

    const wh = new Webhook(webhookSecret);
    let event: any;

    try {
      event = wh.verify(rawBody, headers);
    } catch (err) {
      throw new BadRequestException('Invalid webhook signature');
    }

    // Svix delivers at-least-once and can retry -- always upsert by the
    // Clerk id, never a raw insert, so a duplicate delivery is harmless.
    if (event.type === 'user.created' || event.type === 'user.updated') {
      const { id, email_addresses, first_name, last_name } = event.data;
      const primaryEmail = email_addresses?.[0]?.email_address ?? '';

      await this.authRepository.upsertUserFromClerk(id, {
        email: primaryEmail,
        firstName: first_name ?? '',
        lastName: last_name ?? '',
      });
    }

    return event;
  }
}