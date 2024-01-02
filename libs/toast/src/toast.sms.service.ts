/**
 * @module ToastModule
 */
import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { TOAST_SMS_API_URL, TOAST_SMS_API_VERSION } from "./toast.const";
import { ToastSendError } from "./toast.error";
import { IToastSmsSend } from "./toast.interface";

/**
 * Toast SMS를 사용할 수 있는 서비스
 * @category Provider
 */
@Injectable()
export class ToastSmsService {

    /** Http 서비스 */
    #httpService: HttpService;
    /** 컨픽 서비스 */
    #configService: ConfigService;

    #APPKEY: string;
    #SEND_NO: string;
    #SMS_TITLE: string;
    #IS_SEND: boolean = true;
    /**
     * 
     * @param httpService Http 서비스
     * @param configService 컨픽 서비스
     */
    constructor(httpService: HttpService, configService: ConfigService) {
        this.#httpService = httpService;
        this.#configService = configService;
        this.#APPKEY = this.#configService.get("TOAST_API_KEY");
        this.#SEND_NO = this.#configService.get("TOAST_SMS_SENDNO");
        this.#SMS_TITLE = this.#configService.get("PROJECT_NAME") ?? "안내문자";
        // this.#IS_SEND = this.#configService.get("TOAST_SMS_IS_SEND");
    }

    /**
   * @description Toast Sms 전송
   * @param body 메시지 내용
   * @param phone_num 전송할 휴대폰 번호
   * @error ToastSendError
   */
    public async sendSms(body: string, phone_num: string) {
        const data: IToastSmsSend = {
            body: body,
            sendNo: this.#SEND_NO, //발신번호.
            recipientList: [
                {
                    recipientNo: phone_num, //수신번호.
                },
            ],
            userId: "system",
        };
        if (this.#IS_SEND === true) {
            const url = new URL(`/sms/${TOAST_SMS_API_VERSION}/appKeys/${this.#APPKEY}/sender/auth/sms`, TOAST_SMS_API_URL).href;
            const infoResponse: any = await new Promise((resolve, reject) => {
                this.#httpService
                    .post(url, data)
                    .subscribe({
                        error: err => reject(err),
                        next: response => resolve(response.data)
                    })
            })
            if (infoResponse.header.isSuccessful != true) {
                console.error(infoResponse);
                throw new ToastSendError();
            }
            return infoResponse
        } else {
            return {}
        }
    }

    /**
     * @description LMS전송
     * @param phone_num 전송할 휴대폰 번호
     * @param message 메시지 내용
     * @param title 메시지 제목(없을시 smsTitle으로 발송됨)
     * @error ToastSendError
     */
    public async sendLMS(
        phone_num: string,
        message: string,
        title: string = this.#SMS_TITLE
    ) {
        const data: IToastSmsSend = {
            title: title,
            body: message,
            sendNo: this.#SEND_NO, //발신번호.
            recipientList: [
                {
                    recipientNo: phone_num, //수신번호.
                },
            ],
            userId: "system",
        };
        const url = new URL(`/sms/${TOAST_SMS_API_VERSION}/appKeys/${this.#APPKEY}/sender/mms`, TOAST_SMS_API_URL).href;
        if (this.#IS_SEND === true) {
            const infoResponse: any = await new Promise((resolve, reject) => {
                this.#httpService
                    .post(url, data)
                    .subscribe({
                        error: err => reject(err),
                        next: response => resolve(response.data)
                    })
            })
            if (infoResponse.header.isSuccessful != true) {
                console.error(infoResponse);
                throw new ToastSendError();
            }
            return infoResponse
        } else {
            return {}
        }
    }

    /**
     * @description LMS 다중 전송
     * @param phone_nums 전송할 휴대폰 번호
     * @param message 메시지 내용
     * @param title 메시지 제목, 없을시 SMS_TITLE값으로 전송
     * @param send_number 발송번호, 없을 시 SEND_NO값으로 전송
     * @param requestDate
     * @error ToastSendError
     */
    public async sendLMS_Array(
        phone_nums: [string],
        message: string,
        title: string = this.#SMS_TITLE,
        send_number: string = this.#SEND_NO,
        requestDate: string = null
    ) {
        const data: IToastSmsSend = {
            title: title,
            body: message,
            sendNo: send_number, //발신번호.
            recipientList: phone_nums.map((num) => ({
                recipientNo: num,
            })),
            userId: "admin",
        };
        if (requestDate != null) {
            data["requestDate"] = requestDate;
        }

        const url = new URL(`/sms/${TOAST_SMS_API_VERSION}/appKeys/${this.#APPKEY}/sender/mms`, TOAST_SMS_API_URL).href;
        if (this.#IS_SEND === true) {
            const infoResponse: any = await new Promise((resolve, reject) => {
                this.#httpService
                    .post(url, data)
                    .subscribe({
                        error: err => reject(err),
                        next: response => resolve(response.data)
                    })
            })
            if (infoResponse.header.isSuccessful != true) {
                console.error(infoResponse);
                throw new ToastSendError();
            }
            return infoResponse
        } else {
            return {}
        }
    }

    /**
     *
     * @param phone_nums 전송할 휴대폰 전송 목록
     * @param message 메시지 내용
     * @param send_number 발송번호, 없을 시 SEND_NO값으로 전송
     * @param requestDate
     * @error ToastSendError
     */
    public async sendSMS_Array(
        phone_nums: [string],
        message: string,
        send_number: string = this.#SEND_NO,
        requestDate: string = null
    ) {
        const data: IToastSmsSend = {
            body: message,
            sendNo: send_number, //발신번호.
            recipientList: phone_nums.map((num) => ({
                recipientNo: num,
            })),
            userId: "admin",
        };
        if (requestDate != null) {
            data["requestDate"] = requestDate;
        }
        const url = new URL(`/sms/${TOAST_SMS_API_VERSION}/appKeys/${this.#APPKEY}/sender/sms`, TOAST_SMS_API_URL).href;
        if (this.#IS_SEND === true) {
            const infoResponse: any = await new Promise((resolve, reject) => {
                this.#httpService
                    .post(url, data)
                    .subscribe({
                        error: err => reject(err),
                        next: response => resolve(response.data)
                    })
            })
            if (infoResponse.header.isSuccessful != true) {
                console.error(infoResponse);
                throw new ToastSendError();
            }
            return infoResponse
        } else {
            return {}
        }
    }

    /**
     * 발신번호 리스트 가져오기.
     * @param pageNum 페이지넘버
     * @param pageSize limit
     */
    public async getSendNos(pageNum: Number = 1, pageSize: Number = 10) {
        const url = new URL(`/sms/${TOAST_SMS_API_VERSION}/appKeys/${this.#APPKEY}/sendNos`, TOAST_SMS_API_URL).href
        const infoResponse = await new Promise((resolve, reject) => {
            this.#httpService
                .get(
                    url,
                    {
                        params: {
                            useYn: "Y",
                            pageNum: pageNum,
                            pageSize: pageSize,
                        },
                    }
                )
                .subscribe({
                    error: err => reject(err),
                    next: (response => resolve(response.data))
                })
        })
        return infoResponse
    }
}