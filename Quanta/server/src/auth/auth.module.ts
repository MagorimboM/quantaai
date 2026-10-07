import { AuthController } from '@/auth/auth.controller';
import { AuthService } from '@/auth/auth.service';
import { AuthRepository } from '@/auth/auth.repository';
import { AccessService } from '@/auth/services/access.service';
import {Module} from "@nestjs/common"

// AccessService is exported so any feature module can import AuthModule and
// check "is this company really the caller's?" without repeating the lookup.
// (If this file already exports anything else, keep it.)
@Module({
  controllers: [AuthController],
  providers: [AuthService, AuthRepository, AccessService],
  exports: [AccessService],
})
export class AuthModule {}