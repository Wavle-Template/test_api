import path from 'path';
import supertest from 'supertest';
import { IntrospectionField, IntrospectionObjectType, IntrospectionSchema } from 'graphql'

const IntrospectionQuery = `
query IntrospectionQuery {  __schema {    queryType {      name
        }    mutationType {      name
        }    subscriptionType {      name
        }    types {      ...FullType
        }    directives {      name      description      locations      args {        ...InputValue
            }
        }
    }
}fragment FullType on __Type {  kind  name  description  fields(includeDeprecated: true) {    name    description    args {      ...InputValue
        }    type {      ...TypeRef
        }    isDeprecated    deprecationReason
    }  inputFields {    ...InputValue
    }  interfaces {    ...TypeRef
    }  enumValues(includeDeprecated: true) {    name    description    isDeprecated    deprecationReason
    }  possibleTypes {    ...TypeRef
    }
}fragment InputValue on __InputValue {  name  description  type {    ...TypeRef
    }  defaultValue
}fragment TypeRef on __Type {  kind  name  ofType {    kind    name    ofType {      kind      name      ofType {        kind        name        ofType {          kind          name          ofType {            kind            name            ofType {              kind              name              ofType {                kind                name
                            }
                        }
                    }
                }
            }
        }
    }
}
`

export class SchemaParse {
    private BASE_URL = "localhost:3000";
    private GRAPHQL_PATH = "/graphql";
    private schema: IntrospectionSchema;
    // private static instance: SchemaParse;
    constructor() {
    }

    // public static getInstance() {
    //     return this.instance || (this.instance = new this())
    // }

    private async requestSchema() {
        const response = await supertest(path.join(this.BASE_URL))
            .post(this.GRAPHQL_PATH)
            .send(
                { query: IntrospectionQuery }
            ).expect(200)

        const body: { data: { __schema: IntrospectionSchema } } = response.body;
        this.schema = body.data.__schema;
    }

    async init() {
        await this.requestSchema();
        console.log("스키마 셋팅 완료")
    }

    getQueries() {
        const queries: IntrospectionObjectType = this.schema.types.find(item => item.kind === "OBJECT" && item.name === "Query") as IntrospectionObjectType;
        return queries != null ? queries.fields : []
    }

    getListQueries() {
        const queries = this.getQueries();
        return queries.filter(item => item.args !== undefined && item.args.some(arg => arg.name === "filter") && item.args.filter(arg => arg.type.kind === "NON_NULL").length == 0)
    }

    requestQuery(query: IntrospectionField) {
        return supertest(path.join(this.BASE_URL))
            .post(this.GRAPHQL_PATH)
            .send(
                { query: this.createQueryString(query) }
            )
    }

    private createQueryString(query: IntrospectionField) {

        if (query.type.kind === "NON_NULL" && query.type.ofType.kind === "OBJECT") {
            const typeName = query.type.ofType.name;
            const targetType = this.schema.types.find(item => item.name === typeName) as IntrospectionObjectType;

            return `
            query {
                ${query.name}{
                    ${this.createFields(targetType.fields)}
                }
            }
            `;
        }
        return ""
    }

    private createFields(fileds: readonly IntrospectionField[]) {
        let qText = "";
        if (Array.isArray(fileds)) {
            fileds.forEach((filed: IntrospectionField) => {
                if (filed.type.kind === "NON_NULL") {
                    if (filed.type.ofType.kind === "SCALAR" || filed.type.ofType.kind === "ENUM") {
                        qText += `${filed.name}\n`
                    }
                }
            })
        }
        return qText;
    }
}
