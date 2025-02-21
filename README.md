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
exporter를 docker 컨테이너로 띄우는게 아니라 javaagent 방식으로 jmx_exporter를 각 broker container에 포함시키는 방식<br>
- javaagent
  - JVM이 시작될때 어플리케이션의 main 메소드를 호출하기 전에 호출되는 agent의 premain 메소드를 통해 실행되며 런타임에 어플리케이션의 동작을 변경할 수 있는 어플리케이션
  - jar 확장자로 패키징된다.
  - 원래 어플리케이션이 JVM에 의해 실행되기 전에 클래스의 내용을 변경하거나 추가할 수 있다.

  <br>
[공식문서](https://prometheus.github.io/jmx_exporter/1.1.0/java-agent/)<br>
[공식문서 깃허브](https://github.com/prometheus/jmx_exporter)<br><br>
참고문서
- https://velog.io/@yoonjaeo/JMX-kafka-모니터링
- https://nyyang.tistory.com/186

### [cadvisor](https://github.com/google/cadvisor)
- [prometheus cadvisor 문서](https://prometheus.io/docs/guides/cadvisor/#monitoring-docker-container-metrics-using-cadvisor)
- container 각각의 리소스 사용량을 모니터링하기 위한 도구
- cadavisor 자체로도 모니터링 ui가 있지만, prometheus에 연결해서 사용 가능
- docker.sock을 연결해야 cadvisor에서 컨테이너 정보를 가져올 수 있음

### docker stats와 cadvisor 메트릭 값 차이 존재
참고: https://stackoverflow.com/questions/55117913/docker-stats-shows-different-data-compared-to-cadvisor

```
container_memory_usage_bytes - container_memory_cache = container_memory_working_set_bytes
```