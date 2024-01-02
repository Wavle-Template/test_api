/**
 * @module ToastModule
 */

export interface IToastSmsSend {
    title?: string,
    body: string,
    /** 발신번호 */
    sendNo: string,
    /** 수신번호 리스트 */
    recipientList:
    {
        /** 수신번호 */
        recipientNo: string, //수신번호.
    }[],
    userId: string,
    requestDate?: string
}