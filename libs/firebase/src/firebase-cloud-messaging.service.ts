/**
 * @module FirebaseModule
 */
import { Inject, Injectable, Optional } from "@nestjs/common";
import { app } from "firebase-admin";
import { Message, Notification, NotificationMessagePayload } from "firebase-admin/lib/messaging/messaging-api";
import { FIREBASE_ADMIN } from "./firebase.const";

/**
 * Firebase Cloud Messaging을 원활히 보낼 수 있도록 도와주는 서비스
 * @category Provider
 */
@Injectable()
export class FirebaseCloudMessagingService {
  /** Firebase 어드민 */
  #firebaseAdmin?: app.App;

  /**
   * @param firebaseAdmin Firebase 어드민
   */
  constructor(@Optional() @Inject(FIREBASE_ADMIN) firebaseAdmin?: app.App) {
    this.#firebaseAdmin = firebaseAdmin;
  }

  /**
   * 토픽 셋팅
   * @param token 토큰
   * @param topic 토픽
   * @returns MessagingTopicManagementResponse
   */
  async setTopic(token: string, topic: string) {
    return await this.#firebaseAdmin.messaging().subscribeToTopic(token, topic);
  }

  /**
   * 토픽 삭제
   * @param token 토큰
   * @param topic 토픽
   * @returns MessagingTopicManagementResponse
   */
  async delTopic(token: string, topic: string) {
    return await this.#firebaseAdmin.messaging().unsubscribeFromTopic(token, topic);
  }

  /**
   * 하나의 푸시 알림을 여러 FCM 토큰에게 전송합니다.
   * @param tokens FCM 토큰 목록
   * @param notification 푸시 알림 데이터
   * @param data 추가 데이터
   */
  async sendMulticast<TData extends Record<string, string>>(
    tokens: string[],
    notification: Notification,
    data: TData,
  ): Promise<void> {
    if (this.#firebaseAdmin == null) return;

    const fcmData = { ...data };
    for (const key in fcmData) {
      if (fcmData[key] == null) delete fcmData[key];
    }

    for (let i = 0; i < tokens.length; i += 500) {
      const tokenChunk = tokens.slice(i, i + 500);
      await this.#firebaseAdmin.messaging().sendMulticast({
        tokens: tokenChunk,
        notification: notification,
        data: fcmData,
      });
    }
  }

  /**
   * 여러 개의 푸시 알림을 전송합니다.
   * @param messages 푸시 메시지 목록
   */
  async sendAll(messages: Message[]): Promise<void> {
    for (let i = 0; i < messages.length; i += 500) {
      const messageChunk = messages.slice(i, i + 500);
      await this.#firebaseAdmin.messaging().sendAll(messageChunk);
    }
  }

  async sendTopic<TData extends Record<string, string>>(
    topic: string,
    notification: NotificationMessagePayload,
    data: TData,
  ): Promise<void> {
    await this.#firebaseAdmin.messaging().sendToTopic(topic, {
      data: data,
      notification: notification
    })
  }
}
