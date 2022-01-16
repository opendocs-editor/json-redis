import _callback from "./callback";
import _promise from "./promise";
import redis from "redis";

function usePromise(
    _client?: redis.RedisClientType<redis.RedisModules, redis.RedisScripts>
) {
    return new _promise(_client);
}

usePromise.prototype.useCallback = (
    _client?: redis.RedisClientType<redis.RedisModules, redis.RedisScripts>
) => {
    return new _callback(_client);
};

export default usePromise;
