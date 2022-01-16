import redis from "redis";

interface EventHandlers {
    [key: string]: (() => void)[];
}

interface FlexableObject extends Object {
    [key: string]: unknown;
}

export default class RedisJSONPromiseClient {
    private client: redis.RedisClientType<
        redis.RedisModules,
        redis.RedisScripts
    >;
    private events: EventHandlers = { init: [] };
    private hasInitialized = false;

    constructor(
        _client?: redis.RedisClientType<redis.RedisModules, redis.RedisScripts>,
        host?: string,
        port?: number,
        user?: string,
        pass?: string,
        secure?: boolean,
        dbNumber?: number
    ) {
        if (_client) {
            this.client = _client;
        } else {
            if (host && port && user && pass && secure && dbNumber) {
                this.client = redis.createClient({
                    url: `redis${
                        secure === true ? "s" : ""
                    }://${user}:${pass}@${host}:${port}/${dbNumber}`,
                });
            } else if (host && port && user && pass && secure) {
                this.client = redis.createClient({
                    url: `redis${
                        secure === true ? "s" : ""
                    }://${user}:${pass}@${host}:${port}`,
                });
            } else if (host && port && user && pass) {
                this.client = redis.createClient({
                    url: `redis://${user}:${pass}@${host}:${port}`,
                });
            } else if (host && port) {
                this.client = redis.createClient({
                    url: `redis://${host}:${port}`,
                });
            } else if (host) {
                this.client = redis.createClient({
                    url: `redis://${host}`,
                });
            } else {
                this.client = redis.createClient();
            }
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
        } catch (e) {
            console.error(e);
            return false;
        }
        return true;
    }

    public on(event: string, handler: () => void) {
        this.events[event].push(handler);
    }

    public async set(
        key: string,
        value: FlexableObject
    ): Promise<string | null> {
        try {
            if (!this.hasInitialized)
                throw new ReferenceError("The client has not initialized yet!");
            return await this.client.set(key, JSON.stringify(value));
        } catch (err) {
            console.log(
                `\x1b[41m\x1b[30m ERROR \x1b[0m\x1b[36mRedis Error:\x1b[0m\n${err}`
            );
            return null;
        }
    }

    public async get(key: string): Promise<FlexableObject | null> {
        try {
            if (!this.hasInitialized)
                throw new ReferenceError("The client has not initialized yet!");
            return JSON.parse(
                (await this.client.get(key)) as string
            ) as FlexableObject;
        } catch (err) {
            console.log(
                `\x1b[41m\x1b[30m ERROR \x1b[0m\x1b[36mRedis Error:\x1b[0m\n${err}`
            );
            return null;
        }
    }
}
