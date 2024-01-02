import { BaseUserModule } from '@app/user';
import { Module } from '@nestjs/common';
import { FindAccountService } from './find-account.service';

@Module({
  imports: [BaseUserModule],
  providers: [FindAccountService],
  exports: [FindAccountService],
})
export class FindAccountModule { }
