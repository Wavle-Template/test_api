import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { FileEntity } from "./file.entity";

@Module({
    imports: [TypeOrmModule.forFeature(
        [
            FileEntity
        ]
    )],
    exports: [TypeOrmModule]
})
export class FileEntityModule { }