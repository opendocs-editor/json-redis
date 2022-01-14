import redis from "redis";

export default class RedisJSONCallbackClient {
    private client: redis.RedisClientType<
        redis.RedisModules,
        redis.RedisScripts
    >;

    constructor(
        _client?: redis.RedisClientType<redis.RedisModules, redis.RedisScripts>
    ) {
        if (_client) {
            this.client = _client;
        } else {
            this.client = redis.createClient();
        }
    }
}
