export class ToastSendError extends Error {
    constructor() {
        super("TOAST_SEND_ERROR");
        this.name = "ToastSendError"
    }
}