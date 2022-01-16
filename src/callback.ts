import redis from "redis";

interface EventHandlers {
    [key: string]: (() => void)[];
}

interface FlexableObject extends Object {
    [key: string]: unknown
}

export default class RedisJSONCallbackClient {
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

    public set(key: string, value: FlexableObject, callback: (data: string | null) => void): void {
        if(!this.hasInitialized) throw new ReferenceError("The client has not initialized yet!");
        this.client.set(key, JSON.stringify(value)).then((value) => {
            callback(value);
        }).catch((err) => {
            console.log(`\x1b[41m\x1b[30m ERROR \x1b[0m\x1b[36mRedis Error:\x1b[0m\n${err}`);
            callback(null);
        });
    }

    public get(key: string, callback: (data: FlexableObject | null) => void): void {
        if(!this.hasInitialized) throw new ReferenceError("The client has not initialized yet!");
        this.client.get(key).then((value) => {
            callback(JSON.parse(value as string) as FlexableObject);
        }).catch((err) => {
            console.log(`\x1b[41m\x1b[30m ERROR \x1b[0m\x1b[36mRedis Error:\x1b[0m\n${err}`);
            callback(null);
        });
    }
}
