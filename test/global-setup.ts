import { SchemaParse } from "./schema-parse";

// global-setup.js
const { setup: setupDevServer } = require('jest-dev-server')

module.exports = async function globalSetup() {
    await setupDevServer({
        command: `yarn start:dev`,
        launchTimeout: 50000,
        port: 3000,
    })
    const sParse = new SchemaParse();
    await sParse.init();
    process.env.queries = JSON.stringify(sParse.getListQueries());
    // globalThis.__MONGOD__ = "test";
    // // return sParse.getQueries();
    // return {
    //     schemaParse: sParse
    // }
}