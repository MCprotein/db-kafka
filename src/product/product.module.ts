import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'PRODUCT_SERVICE',
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
            groupId: 'nestjs-product-consumer',
          },
        },
      },
    ]),
  ],
})
export class ProductModule {}