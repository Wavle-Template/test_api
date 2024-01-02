import { Module } from '@nestjs/common';
import { InquireService } from './inquire.service';
import { InquireResolver } from './inquire.resolver';
import { NotificationModule } from '../notification/notification.module';
import { UserLoader } from '../user/user.loader';
import { InquireLoader } from './inquire.loader';
import { UserModule } from '../user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InquireEntity } from './inquire.entity';
import { AuthModule } from '@app/auth';

@Module({
  imports: [AuthModule, UserModule, NotificationModule, TypeOrmModule.forFeature([InquireEntity])],
  providers: [InquireService, InquireResolver, UserLoader, InquireLoader]
})
export class InquireModule { }
