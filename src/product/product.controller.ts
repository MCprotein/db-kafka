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

  /**
   * @MessagePattern decorator
   * @MessagePattern decorator 사용시 return하면 reply topic에 메세지가 발행되는 원리
   * 1. nest/packages/microservices/decorators/message-pattern.decorator.ts에 MessagePattern decorator 존재
   *    PATTERN_METADATA, PATTERN_HANDLER_METADATA, TRANSPORT_METADATA, PATTERN_EXTRAS_METADATA 4가지의 metadata에 대해 reflect에 저장
   * 2. nest/packages/microservices/listener-metadata-explorer.ts에 있는 exploreMethodMetadata 메소드에서 1번에서 저장한 metadata를 가져옴
   *    같은 파일에 있는 explore 메소드에서 exploreMethodMetadata 메소드 호출
   * 3. nest/packages/microservices/listeners-controller.ts에 있는 registerPatternHandlers 메소드에서 2번의 explore 메소드 호출하여 decorator가 붙은 handler와 metadata를 가져옴
   *    static 메소드가 아니므로 createRequestScopedHandler 메소드를 호출하여 얻은 반환값을 server.addHandler 메소드에 넣어 호출
   *
   *    createRequestScopedHandler 메소드에서는 온전한 handler를 얻어 실행하고 반환값을 반환하는 requestScopedHandler 함수 자체를 반환함
   *
   */
  /**
   * 앱 실행 순서
   * 1. main.ts에서 app.connectMicroservice(options) 메소드를 실행
   * 2. connectMicroservice 메소드에서 @nestjs/microservices 패키지의 NestMicroservice 클래스를 가져옴
   * 3. connectMicroservice 메소드의 인자로 받은 config를 NestMicroservice의 생성자에 파라미터로 넣어 instance를 만들고 instance.registerListeners 메소드로 리스너를 등록
   * 4. 리스너를 등록한 instance를 this.microservices에 push
   * 5. main.ts에서 app.startAllMicroservices() 메소드를 실행
   * 6. startAllMicroservices 메소드에서 3번에서 push한 this.microservices를 순회하며 각 instance의 listen 메소드를 실행
   * 7. 3번의 instance는 nest/packages/microservices/nest-microservice.ts에 있는 NestMicroservice 클래스의 인스턴스
   * 8. 3번에서 NestMicroservice instance가 생성될때 클래스의 생성자에서 createServer(config) 메소드 실행
   * 9. createServer 메소드에서 ServerFactory.create(this.microserviceConfig) 메소드를 실행하여 this.server에 ServerKafka 인스턴스를 할당
   * 10. 6번에서 instance의 listen 메소드를 실행하면 NestMicroservice의 listen 메소드가 실행되는데,
   *     listen 메소드 안에서 this.server.listen(callback) 메소드가 실행되어 ServerKafka의 listen 메소드가 실행됨
   * 11. ServerKafka의 listen 메소드 안에서 this.start(callback) 메소드 실행
   * 12. ServerKafka의 start 메소드 안에서 this.bindEvents 메소드 실행
   * 13. ServerKafka의 bindEvents 메소드 안에서 this.getMessageHandler 메소드를 실행하여 반환된 값을 consumer의 eachMessage 옵션으로 사용하여 consumer.run 메소드 실행
   *     consumer.run 메소드는 kafkajs에서 consume 하는 메소드로, eachMessage 옵션에 콜백함수를 넣으면 그 콜백함수로 consume한 메세지를 받을 수 있다.
   * 14. ServerKafka의 getMessageHandler 메소드는 this.handlerMessage 메소드를 실행하는 콜백함수를 반환
   * 15. handlerMessage 메소드 안에서는 consume한 메세지의 headers에서 reply topic과 partition을 찾아 getPublisher 메소드 반환값을 this.send에 넣어 실행
   *     getPublisher 메소드는 sendMessage 메소드를 실행하는 콜백함수를 반환하는데, 이 안에서 producer.send 메소드를 호출함
   * 16. this.send는 ServerKafka가 상속받고있는 Server 클래스의 send 메소드이다. getPublisher에서 반환한 콜백함수를 실행하여 reply topic에 메세지를 발행함
   *
   * 메세지 발행시 headers에 reply topic 포함 원리
   *   subscribeToResponseOf 메소드에서 responsePatterns에 reply topic 이름 추가
   *   -> ClientKafka 클래스의 connect 메소드가 실행될때 bindTopics 메소드가 실행되는데, 이 안에서 reply topc subscribe
   *   -> 왜 subscribe 하는지는 모르겠음
   * clientKafka의 send 메소드를 호출하면 ClientProxy 클래스의 send 메소드가 실행되는데, 이 안에서 clientKafka의 publish 메소드 호출
   * clientKafka의 publish 메소드 안에서 this.producer.send 메소드를 호출하는데 이때 message의 headers에 reply topic을 추가함
   * 근데 이 reply topic은 send 메소드의 첫번째 인자로 들어온 topic name에 .reply를 붙인것이다.
   */
  @MessagePattern(PRODUCT_TOPIC)
  consumer(@Payload() message: any) {
    message.reply = 'reply';
    message.replyTime = new Date();
    return message;
  }

  @MessagePattern(`${PRODUCT_TOPIC}.reply`)
  replyConsumer(@Payload() message: any) {
    console.log(message, 'replyConsumer');
  }
}
