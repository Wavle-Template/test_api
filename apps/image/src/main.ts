import { ValidationPipe } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { MicroserviceOptions, RpcException, Transport } from "@nestjs/microservices";
import { AppModule } from "./app.module";

async function bootstrap() {
  const configApp = await NestFactory.createApplicationContext(ConfigModule.forRoot());
  const configService = configApp.get(ConfigService);

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.RMQ,
    options: {
      urls: [configService.get<string>("RABBITMQ_URL")],
      noAck: false,
      queue: "image_queue",
      queueOptions: {
        durable: true,
      },
    },
  });
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      exceptionFactory: err => {
        throw new RpcException(err);
      },
    }),
  );

  await app.listen();
}

bootstrap();
