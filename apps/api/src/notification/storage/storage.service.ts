/**
 * @module NotificationStorageModule
 */
import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { CRUDService } from '@yumis-coconudge/common-module';
import { EntityManager, LessThanOrEqual } from 'typeorm';
import { UserRole, UserState } from '@app/entity';
import { UserService } from '../../user/user.service';
import { NotificationService } from '../notification.service';
import { NotificationStorageEntity } from './storage.entity';
import { NotificationStorageTargetType } from './storage.enum';
import { DateTime } from 'luxon'
import { Cron, CronExpression } from '@nestjs/schedule';
import { NotificationEntity } from '@app/entity/notification/notification.entity';

@Injectable()
export class NotificationStorageService extends CRUDService<NotificationStorageEntity> {

    private TIME_ZONE = "Asia/Seoul";

    /**
   * @param entityManager TypeORM 엔티티 매니저
   */
    constructor(
        @InjectEntityManager() entityManager: EntityManager,
        @Inject(forwardRef(() => NotificationService))
        public notificationService: NotificationService,
        public userService: UserService
    ) {
        super(entityManager, NotificationStorageEntity);
    }

    async send(
        info: NotificationStorageEntity,
        transactionManager?: EntityManager
    ): Promise<NotificationEntity> {
        let recipients = [];
        if (info.target === NotificationStorageTargetType.ALL) {
            recipients = await this.userService.allIds(UserState.ACTIVE, UserRole.MEMBER);
        } else if (info.target === NotificationStorageTargetType.SPECIFIC) {
            if (info.recipients === undefined || info.recipients === null || info.recipients.length === 0) {
                throw new Error("recipients is empty")
            }
            recipients = info.recipients;
        } else if (info.target === NotificationStorageTargetType.ANDROID) {
            //TODO #58:구현필요
        } else if (info.target === NotificationStorageTargetType.iOS) {
            //TODO #58:구현필요
        } else {
            throw new Error("BAD_REQUEST")
        }
        return this.useTransaction(async (manage) => {
            return await this.notificationService.send({
                title: info.title,
                message: info.message,
                imageURL: info.imageURL,
                isCreatedForAdmin: true,
                relationId: info.relationId,
                type: info.type,
                url: info.url,
                recipients: recipients
            }, manage)
        }, transactionManager)
    }

    sliceScheduledAt(date: Date): Date {
        const scheduledAt = DateTime.fromJSDate(date, { zone: this.TIME_ZONE });
        const inputScheduledAt = DateTime.fromObject({
            year: scheduledAt.year,
            month: scheduledAt.month,
            day: scheduledAt.day,
            hour: scheduledAt.hour + (scheduledAt.minute > 30 ? 1 : 0),
            minute: scheduledAt.minute > 30 ? 0 : 30,
            second: 0,
            millisecond: 0,
        })
        return inputScheduledAt.toJSDate();
    }

    @Cron(CronExpression.EVERY_30_MINUTES, { timeZone: "Asia/Seoul" })
    private async sendSheduler() {
        const now = DateTime.now().toJSDate();
        this.logger.log("예약 알림 저장소 전송 스케쥴러 동작")
        const notifications = await this.repository.find({
            where: {
                isSend: false,
                scheduledAt: LessThanOrEqual(now)
            }
        });
        this.logger.log("검색된 예약 알림 개수 : ", notifications.length);
        for await (const noti of notifications) {
            this.send(noti);
            await this.repository.update(noti.id, { isSend: true })
        }
    }
}
