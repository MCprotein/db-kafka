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

Debezium connector 등록 옵션
```json
{
  "name": "debezium-for-mongodb-cdc-secondary1",
  "config": {
    "connector.class": "io.debezium.connector.mongodb.MongoDbConnector",
    "mongodb.connection.string": "mongodb://jjangu:wow@mongo_secondary1:27017/?replicaSet=mongo-replica",
    "topic.prefix": "mongodb",
    "collection.include.list": "shop.product"
  }
}
```

## mongodb topic에서 before 항목에 null로 입력된다면 아래 설정 필요

### [1. cature.mode 설정](https://debezium.io/documentation/reference/stable/connectors/mongodb.html#mongodb-property-capture-mode)
PATCH http://localhost:8083/connectors/:connectorName/config
```json
{
  "capture.mode": "change_streams_update_full_with_pre_image",
  "capture.mode.full.update.type": "lookup"
}
```
### 2. mongodb changeStreams 설정 변경 (mongodb 버전 6.0 이상 가능)
```sh
db.runCommand( {
   collMod: <collection>,
   changeStreamPreAndPostImages: { enabled: <boolean> }
} )
```
```sh
db.runCommand({collMod: "category", changeStreamPreAndPostImages: {enabled: true}})
```
- [참고1 - stackoverflow](https://stackoverflow.com/questions/77287900/debezium-connect-doesnt-provide-before-field-after-updating-an-item)
- [참고2 - mongodb docs](https://www.mongodb.com/ko-kr/docs/v6.0/reference/command/collMod/#change-streams-with-document-pre--and-post-images)

### [linux에 node exporter 설치](https://prometheus.io/docs/prometheus/latest/getting_started/#downloading-and-running-prometheus)
다운로드 링크: https://prometheus.io/download/#node_exporter
```bash
wget https://github.com/prometheus/node_exporter/releases/download/v1.8.2/node_exporter-1.8.2.linux-amd64.tar.gz
tar xvfz node_exporter-1.8.2.linux-amd64.tar.gz
cd node_exporter-1.8.2.linux-amd64
./node_exporter
```
prometheus.yml에서 docker 내 접근을 위해 host를 host.docker.internal로 설정
<br>
<br>
JMX_EXPORTER -> docker image 없음
https://github.com/prometheus/jmx_exporter <br>
bitnami/jmx-exporter -> 공식문서 부실
https://hub.docker.com/r/bitnami/jmx-exporter
danielqsj/kafka-exporter -> 공식문서 굿, jmx랑 약간 다름
https://hub.docker.com/r/danielqsj/kafka-exporter

### 최종 선택한 exporter: jmx_exporter
작성예정

