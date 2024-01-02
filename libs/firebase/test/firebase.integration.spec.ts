import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import SettingConfig from '@app/setting'
import { getMockDbConnection } from '@test/utils/mock-db';
import { FirebaseCloudMessagingService, FirebaseModule } from '@app/firebase';
import { FIREBASE_ADMIN } from '@app/firebase/firebase.const';
import admin from "firebase-admin";

describe('Firebase-Integration-Test', () => {
    let module: TestingModule
    let connection;

    beforeAll(async () => {

        connection = await getMockDbConnection([
            
        ])
        module = await Test.createTestingModule({
            imports: [
                ConfigModule.forRoot({
                    load: [SettingConfig]
                }),
                TypeOrmModule.forRoot(),
                FirebaseModule
            ],
        }).overrideProvider(Connection)
            .useValue(connection)
            .compile();

    });

    it('should be defined FirebaseCloudMessagingService', () => {
        expect(module.get<FirebaseCloudMessagingService>(FirebaseCloudMessagingService)).toBeDefined();
    });

    it('should be defined FIREBASE_ADMIN', () => {
        expect(module.get<admin.app.App>(FIREBASE_ADMIN)).toBeDefined();
    });

    it('should be defined module', () => {
        expect(module.get<FirebaseModule>(FirebaseModule)).toBeDefined();
    });

    afterAll(async () => {
        if (module) await module.close();
        if (connection) await connection.close();
    })


});
