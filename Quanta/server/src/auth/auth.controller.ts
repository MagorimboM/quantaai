import { Controller, Post, Req, Res, BadRequestException } from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { Public } from '@/auth/services/public.decorator';

// ---- Authentication, now via Clerk ----
// Clerk owns sign-up, sign-in, passwords and sessions entirely on the frontend.
// This controller no longer needs a register/login/logout/`/me` endpoint of its
// own -- there's nothing left for the backend to authenticate, since Clerk
// already did that before any request reaches here.
//
// What this backend still needs, and what's below:
//  - a webhook Clerk calls when a user is created/updated, so the local User
//    table stays in sync (see AuthService.handleClerkWebhook)
//  - ClerkAuthGuard (separate file) verifies the token on protected routes
//    elsewhere in the app -- this controller doesn't need it for the webhook
//    itself, since the webhook is authenticated by its own signature, not a
//    user's session token.
//
// TODO :: [auth] Replace every hardcoded userId ('seed-user-001', 'seed-user-100')
// in the other controllers with the logged-in user, via ClerkAuthGuard + the
// ClerkUserId decorator, using AuthRepository.findByClerkId(...) for the
// local user lookup.

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('webhook')
  async handleClerkWebhook(@Req() req: Request, @Res() res: Response) {
    const svixId = req.headers['svix-id'] as string;
    const svixTimestamp = req.headers['svix-timestamp'] as string;
    const svixSignature = req.headers['svix-signature'] as string;

    if (!svixId || !svixTimestamp || !svixSignature) {
      throw new BadRequestException('Missing required Svix headers');
    }

    // req.body must be the raw Buffer here, not parsed JSON -- see the
    // main.ts change for why, and make sure it's actually applied.
    await this.authService.handleClerkWebhook(req.body, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    });

    // Respond quickly -- Clerk/Svix retries on non-2xx or slow responses.
    return res.status(200).json({ received: true });
  }
}