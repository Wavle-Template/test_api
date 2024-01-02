import { registerEnumType } from "@nestjs/graphql";

export enum FcmTokenOsEnum {
    ANDROID = "ANDROID",
    IOS = "IOS",
    WEB = "WEB"
}

registerEnumType(FcmTokenOsEnum, {
    name: "FcmTokenOsEnum",
    description: "Fcm토큰 OS",
    valuesMap: {
        ANDROID: { description: "AOS" },
        IOS: { description: "iOS" },
        WEB: { description: "web" }
    }
})