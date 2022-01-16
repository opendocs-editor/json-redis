import redis from "redis";

interface EventHandlers {
    [key: string]: (() => void)[];
}

interface FlexableObject extends Object {
    [key: string]: unknown
}

export default class RedisJSONPromiseClient {
    private client: redis.RedisClientType<
        redis.RedisModules,
        redis.RedisScripts
    >;
    private events: EventHandlers = {};
    private hasInitialized: boolean = false;

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

    private async init(): Promise<boolean> {
        try {
            await this.client.connect();
            this.hasInitialized = true;
            for (let i = 0; i < this.events.init.length; i++) {
                this.events.init[i]();
            }
        } catch(e) {
            console.error(e);
            return false;
        }
        return true;
    }

    public on(event: string, handler: () => void) {
        this.events[event].push(handler);
    }

    public async set(key: string, value: FlexableObject): Promise<string | null> {
        try {
            if(!this.hasInitialized) throw new ReferenceError("The client has not initialized yet!");
            return await this.client.set(key, JSON.stringify(value));
        } catch(err) {
            console.log(`\x1b[41m\x1b[30m ERROR \x1b[0m\x1b[36mRedis Error:\x1b[0m\n${err}`);
            return null;
        }
    }

    public async get(key: string): Promise<FlexableObject | null> {
        try {
            if(!this.hasInitialized) throw new ReferenceError("The client has not initialized yet!");
            return (JSON.parse((await this.client.get(key)) as string)) as FlexableObject;
        } catch(err) {
            console.log(`\x1b[41m\x1b[30m ERROR \x1b[0m\x1b[36mRedis Error:\x1b[0m\n${err}`);
            return null;
        }
    }
}
