import { Controller, Post, Body } from '@nestjs/common';

// Quanta task list, paste at the top of any file or into a scratch file
// Filter by tag: [auth] [workspace] [cleanup] [infra] [later]

// ---- 1. Authentication (do first, most other items depend on it) ----
// TODO :: [auth] Backend: register endpoint (hash the password, never store it plain)
// TODO :: [auth] Backend: login endpoint that sets an httpOnly cookie (no tokens in localStorage)
// TODO :: [auth] Backend: logout endpoint and a /me endpoint that returns the current user
// TODO :: [auth] Backend: auth guard plus a CurrentUser decorator for protected routes
// TODO :: [auth] Replace every hardcoded userId ('seed-user-001', 'seed-user-100') in the controllers with the logged-in user


@Controller('auth')
export class AuthController {

    @Post('register')
    async registerNewUser ( @Body() request: {email:string; password:string}){
        
    }; 
}
