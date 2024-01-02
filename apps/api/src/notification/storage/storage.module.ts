/**
 * @module NotificationStorageModule
 */

import { forwardRef, Module } from '@nestjs/common';
import { NotificationStorageService } from './storage.service';
import { NotificationStorageResolver } from './storage.resolver';
import { NotificationModule } from '../notification.module';
import { ScheduleModule } from '@nestjs/schedule';
import { UserModule } from '../../user/user.module';
import { AuthModule } from '@app/auth';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationStorageEntity } from './storage.entity';

@Module({
  imports: [forwardRef(() => NotificationModule), TypeOrmModule.forFeature([NotificationStorageEntity]), UserModule, AuthModule, ScheduleModule.forRoot()],
  providers: [NotificationStorageService, NotificationStorageResolver],
})
export class NotificationStorageModule { }
