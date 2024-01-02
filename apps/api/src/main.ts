import path from "path";
import fs from "fs/promises";
import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { FastifyAdapter, NestFastifyApplication } from "@nestjs/platform-fastify";
import fastifyMultipart from "fastify-multipart";
import { AppModule } from "./app.module";
import { GraphQLErrorFilter } from "@yumis-coconudge/common-module";

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());
  const configService = app.get(ConfigService);

  await app.register(fastifyMultipart, {
    throwFileSizeLimit: true,
    limits: { fileSize: configService.get("FILE_MAX_SIZE") },
  });

  app.useGlobalFilters(new GraphQLErrorFilter());
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  const documentConfig = new DocumentBuilder().build();
  const document = SwaggerModule.createDocument(app, documentConfig);
  SwaggerModule.setup("openapi", app, document);
  fs.writeFile(path.join(process.cwd(), "openapi.json"), JSON.stringify(document, null, 2), "utf-8");

  await app.listen(3000);
}

bootstrap();
