import { SchemaParse } from "./schema-parse";

module.exports = async () => ({
    "moduleFileExtensions": [
        "js",
        "json",
        "ts"
    ],
    "rootDir": "../",
    "testEnvironment": "node",
    "testRegex": ".unit.spec.ts$",
    "transform": {
        "^.+\\.(t|j)s$": "ts-jest"
    },
    // "reporters": [
    //     'default',
    //     ['jest-junit', { outputDirectory: 'reports', outputName: 'report.xml' }],
    // ],
    "moduleNameMapper": {
        "^@app/entity(|/.*)$": "<rootDir>/libs/entity/src/$1",
        "^@app/b-chat(|/.*)$": "<rootDir>/libs/b-chat/src/$1",
        "^@app/chat(|/.*)$": "<rootDir>/libs/chat/src/$1",
        "^@app/user(|/.*)$": "<rootDir>/libs/user/src/$1",
        "^@app/auth(|/.*)$": "<rootDir>/libs/auth/src/$1",
        "^@app/search(|/.*)$": "<rootDir>/libs/search/src/$1",
        "^@app/notification(|/.*)$": "<rootDir>/libs/notification/src/$1",
        "^@app/firebase(|/.*)$": "<rootDir>/libs/firebase/src/$1",
        "^@app/file(|/.*)$": "<rootDir>/libs/file/src/$1",
        "^@app/community(|/.*)$": "<rootDir>/libs/community/src/$1",
        "^@app/phone-auth(|/.*)$": "<rootDir>/libs/phone-auth/src/$1",
        "^@app/toast(|/.*)$": "<rootDir>/libs/toast/src/$1",
        "^@app/setting(|/.*)$": "<rootDir>/libs/setting/src/$1",
        "^@app/service-manage(|/.*)$": "<rootDir>/libs/service-manage/src/$1",
        "^@app/follow-generate(|/.*)$": "<rootDir>/libs/follow-generate/src/$1",
        "^@app/match(|/.*)$": "<rootDir>/libs/match/src/$1",
        "^@app/find-account(|/.*)$": "<rootDir>/libs/find-account/src/$1",
        "^@app/common-chat-res(|/.*)$": "<rootDir>/libs/common-chat-res/src/$1",
        "^@test/utils(|/.*)$": "<rootDir>/test/utils/$1",
        "^@app/microservice(|/.*)$": "<rootDir>/libs/microservice/src/$1",
        "^@app/mailer(|/.*)$": "<rootDir>/libs/mailer/src/$1"
    }
})