import { AuthModule } from '@app/auth';
import { FileEntityModule, UserEntityModule } from '@app/entity';
import { Module } from '@nestjs/common';
import { BaseUserLoader } from './user.loader';
import { BaseUserService } from './user.service';

@Module({
  imports: [UserEntityModule, FileEntityModule, AuthModule],
  providers: [BaseUserService, BaseUserLoader],
  exports: [BaseUserService, BaseUserLoader],
})
export class BaseUserModule { }
