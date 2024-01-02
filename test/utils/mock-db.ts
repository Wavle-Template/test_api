import { UserEntity, UserSocialEntity, UserFCMTokenEntity, UserFollowEntity, UserProfileEntity, UserBlockEntity, UserNotificationSettingEntity, FileEntity } from "@app/entity";
import { NotificationEntity } from "@app/entity/notification/notification.entity";
import { NotificationReadEntity } from "@app/entity/notification/read/read.entity";
import { UserArchiveEntity } from "@app/entity/user/archive/user-archive.entity";
import { UserSuspenedLogEntity } from "@app/entity/user/log/suspended.entity";
import { SleeperEntity } from "@app/entity/user/sleeper/sleeper.entity";
import { DataType, IMemoryDb, newDb } from "pg-mem";
import { v4 } from 'uuid'

const getMockDbConnection = async (entities: any[]) => {
    const db = newDb();

    const incriminatedQuery = `SELECT columns.*,
              pg_catalog.col_description(('"' || table_catalog || '"."' || table_schema || '"."' || table_name || '"')::regclass::oid, ordinal_position) AS description,
              ('"' || "udt_schema" || '"."' || "udt_name" || '"')::"regtype" AS "regtype",
              pg_catalog.format_type("col_attr"."atttypid", "col_attr"."atttypmod") AS "format_type"
              FROM "information_schema"."columns"
              LEFT JOIN "pg_catalog"."pg_attribute" AS "col_attr"
              ON "col_attr"."attname" = "columns"."column_name"
              AND "col_attr"."attrelid" = (
                SELECT
                  "cls"."oid" FROM "pg_catalog"."pg_class" AS "cls"
                  LEFT JOIN "pg_catalog"."pg_namespace" AS "ns"
                  ON "ns"."oid" = "cls"."relnamespace"
                WHERE "cls"."relname" = "columns"."table_name"
                AND "ns"."nspname" = "columns"."table_schema"
              )`;

    db.public.interceptQueries(text => {
        if (text.replace(/[\n ]/g, '').startsWith(incriminatedQuery.replace(/[\n ]/g, ''))) {
            return [];
        }
        return null;
    })

    // SELECT * FROM current_database() 의 결과를 test로 지정
    db.public.registerFunction({
        name: "current_database",
        implementation: () => "test",
    });
    db.getSchema().registerFunction({
        name: 'uuid_generate_v4',
        returns: DataType.uuid,
        implementation: v4,
        impure: true,
    });

    const connection = await db.adapters.createTypeormConnection({
        type: "postgres",
        entities: entities.concat([
            UserEntity, UserSocialEntity,
            UserFCMTokenEntity, UserFollowEntity,
            UserProfileEntity, UserBlockEntity,
            UserNotificationSettingEntity, FileEntity
        ]),
        // autoLoadEntities: true,
        synchronize: false,
    });
    await connection.synchronize();
    return connection;
}

export { getMockDbConnection }