import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { Partitioners } from 'kafkajs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: ['localhost:29092', 'localhost:39092', 'localhost:49092'],
        connectionTimeout: 5000,
        retry: {
          retries: 5,
        },
      },
      consumer: {
        groupId: 'nestjs-main-consumer',
      },
      /**
       * https://docs.nestjs.com/microservices/kafka#message-pattern
       * To prevent the ClientKafka consumers from losing response messages,
       * a Nest-specific built-in custom partitioner is utilized.
       * This custom partitioner assigns partitions to a collection of consumers
       * sorted by high-resolution timestamps (process.hrtime()) that are set on application launch.
       */
      // producer: {
      //   createPartitioner: Partitioners.LegacyPartitioner,
      // },
    },
  });
  await app.startAllMicroservices();
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
