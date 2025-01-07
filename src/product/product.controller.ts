import { Controller, Get, Inject, OnModuleInit, Param } from '@nestjs/common';
import { ClientKafka, MessagePattern, Payload } from '@nestjs/microservices';
import { PRODUCT_TOPIC } from '../constant';
import { finalize, lastValueFrom } from 'rxjs';

@Controller('product')
export class ProductController implements OnModuleInit {
  constructor(
    @Inject('PRODUCT_SERVICE')
    private readonly client: ClientKafka,
  ) {}

  onModuleInit() {
    this.client.subscribeToResponseOf('product');
  }

  @Get('create/:id')
  async create(@Param('id') id: string) {
    return await lastValueFrom(
      this.client
        .send(PRODUCT_TOPIC, {
          type: 'create',
          id: id || new Date(),
        })
        .pipe(finalize(() => console.log('끝'))),
    );
  }

  @MessagePattern(PRODUCT_TOPIC)
  consumer(@Payload() message: any) {
    message.reply = 'reply';
    message.replyTime = new Date();
    return message;
  }
}
