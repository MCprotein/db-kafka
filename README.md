1. kafka 클러스터링 구성
  - zookeeper 모드 대신 KRaft 모드 사용
2. CDC 구성
  - Debezium 사용
3. Transactional Outbox Pattern 구성
  - Kafka Connect 사용

[NestJS Kafka Documentation](https://docs.nestjs.com/microservices/kafka) 

[[Kafka KRU] Consumer 내부 동작 원리와 구현](https://devocean.sk.com/community/detail.do?ID=165478&boardType=DEVOCEAN_STUDY&page=1)

[Package.json - Environment Variables](https://docs.npmjs.com/cli/v7/using-npm/config#environment-variables)

[nestjs-console](https://www.npmjs.com/package/nestjs-console)
```bash
$ npm run start:cli:dev --command=product --arg=array 123 456
```

Debezium connector 등록 옵션
[참고1](https://debezium.io/documentation/reference/stable/tutorial.html#deploying-mysql-connector)
[참고2](https://debezium.io/documentation/reference/stable/connectors/mysql.html#mysql-connector-properties)
```json
{
  "name": "debezium-for-cdc",  
  "config": {  
    "connector.class": "io.debezium.connector.mysql.MySqlConnector",
    "tasks.max": "1",  
    "database.hostname": "mysql",  
    "database.port": "3306",
    "database.user": "root",
    "database.password": "hello",
    "database.server.id": "184054",  
    "topic.prefix": "cdc-server-1",  
    "database.include.list": "kafkacdc",  
    "schema.history.internal.kafka.bootstrap.servers": "broker-1:19092, broker-2:19092, broker-3:19092",  
    "schema.history.internal.kafka.topic": "schema-changes.kafkacdc"  
  }
}
```

debezium 연결된 모습 (kafka-ui)
![kafka-ui](https://github.com/user-attachments/assets/d161d95f-5626-413d-931f-9bd15865bf65)

### mongodb docker cluster (replica set)
- https://www.mongodb.com/resources/products/compatibilities/deploying-a-mongodb-cluster-with-docker
- https://velog.io/@youngeui_hong/Docker%EB%A5%BC-%EC%82%AC%EC%9A%A9%ED%95%98%EC%97%AC-MongoDB-Replica-Set-%EA%B5%AC%EC%B6%95%ED%95%98%EA%B8%B0
```js
rs.initiate({
  _id: "mongo-replica", 
  members: [
    {_id: 0, host: "mongo_primary"}, 
    {_id: 1, host: "mongo_secondary1"}, 
    {_id: 2, host: "mongo_secondary2"}
    ]
})
```