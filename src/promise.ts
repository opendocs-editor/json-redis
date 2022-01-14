import redis from "redis";

interface EventHandlers {
    [key: string]: (() => void)[];
}

export default class RedisJSONPromiseClient {
    private client: redis.RedisClientType<
        redis.RedisModules,
        redis.RedisScripts
    >;
    private events: EventHandlers = {};

    constructor(
        _client?: redis.RedisClientType<redis.RedisModules, redis.RedisScripts>
    ) {
        if (_client) {
            this.client = _client;
        } else {
            this.client = redis.createClient();
        }
        this.client.on("error", (err) => {
            console.log(
                `\x1b[41m\x1b[30m ERROR \x1b[0m\x1b[36mRedis Error:\x1b[0m\n${err}`
            );
        });
        this.init();
    }

    private async init() {
        await this.client.connect();
        for (let i = 0; i < this.events.init.length; i++) {
            this.events.init[i]();
        }
    }

    public on(event: string, handler: () => void) {
        this.events[event].push(handler);
    }
}
