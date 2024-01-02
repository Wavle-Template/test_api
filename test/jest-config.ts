import { SchemaParse } from "./schema-parse";

module.exports = async () => ({
    "moduleFileExtensions": [
        "js",
        "json",
        "ts"
    ],
    "rootDir": ".",
    "testEnvironment": "node",
    "testRegex": ".request.spec.ts$",
    "transform": {
        "^.+\\.(t|j)s$": "ts-jest"
    },
    // "globals": {
    //     Queries: await getQueries()
    // },
    "globalSetup":"./global-setup.ts",
    "globalTeardown":"./global-teardown.ts",
    "setupFilesAfterEnv": ['./setup.ts'],
})