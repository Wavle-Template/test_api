/**
 * @module WavleMailerModule
 */
import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { SentMessageInfo } from 'nodemailer';

/**
 * nodemailer로 메일을 전송하는 서비스
 * @category Provider
 */
@Injectable()
export class WavleMailerService {
    #mailerService: MailerService
    constructor(mailerService: MailerService) {
        this.#mailerService = mailerService;
    }

    async sendSimple(to: string | string[] | { name: string, address: string } | { name: string, address: string }[], subject: string, text: string): Promise<SentMessageInfo> {
        return await this.#mailerService.sendMail({
            to: to,
            subject: subject,
            text: text
        })
    }

    async sendHtml(to: string | string[] | { name: string, address: string } | { name: string, address: string }[], subject: string, html: string): Promise<SentMessageInfo> {
        return await this.#mailerService.sendMail({
            to: to,
            subject: subject,
            html: html,
        })
    }

}
