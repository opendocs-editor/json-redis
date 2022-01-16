import redis from "redis";

interface EventHandlers {
    [key: string]: (() => void)[];
}

interface FlexableObject extends Object {
    [key: string]: unknown;
}

export default class RedisJSONCallbackClient {
    private client: redis.RedisClientType<
        redis.RedisModules,
        redis.RedisScripts
    >;
    private events: EventHandlers = {};
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

    public set(
        key: string,
        value: FlexableObject,
        callback: (data: string | null) => void
    ): void {
        if (!this.hasInitialized)
            throw new ReferenceError("The client has not initialized yet!");
        this.client
            .set(key, JSON.stringify(value))
            .then((value) => {
                callback(value);
            })
            .catch((err) => {
                console.log(
                    `\x1b[41m\x1b[30m ERROR \x1b[0m\x1b[36mRedis Error:\x1b[0m\n${err}`
                );
                callback(null);
            });
    }

    public get(
        key: string,
        callback: (data: FlexableObject | null) => void
    ): void {
        if (!this.hasInitialized)
            throw new ReferenceError("The client has not initialized yet!");
        this.client
            .get(key)
            .then((value) => {
                callback(JSON.parse(value as string) as FlexableObject);
            })
            .catch((err) => {
                console.log(
                    `\x1b[41m\x1b[30m ERROR \x1b[0m\x1b[36mRedis Error:\x1b[0m\n${err}`
                );
                callback(null);
            });
    }
}
