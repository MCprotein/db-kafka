import { Controller, Get, Inject, OnModuleInit, Param } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';

@Controller('product')
export class ProductController implements OnModuleInit {
  constructor(
    @Inject('PRODUCT_SERVICE')
    private readonly client: ClientKafka,
  ) {}

  onModuleInit() {
    console.log(this.client);
    this.client.subscribeToResponseOf('product');
  }

  @Get('create/:id')
  create(@Param('id') id: string) {
    this.client
      .send('product', {
        type: 'create',
        id: id || new Date(),
      })
      .subscribe({
        next: (data) => console.log(data),
        error: (error) => console.log(error),
        complete: () => console.log('끝'),
      });

    return '끝';
  }
}
