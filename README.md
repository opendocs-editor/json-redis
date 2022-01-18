# json-redis

An easy JSON module for Redis on the client side.

## About

json-redis is a quick promise-based Node.js module to allow you to store objects in Redis.
Note: This is NOT redis-json. This works 100% on the client-side and does not need any server-side configuration.

## Usage

Connecting:

```javascript
const jsonRedis = require("json-redis");

const instance = jsonRedis.default();

instance.on("init", () => {
    console.log("Connected!");
});
```

To use a custom host, use:

```javascript
const jsonRedis = require("json-redis");
const redis = require("redis");

const instance = jsonRedis.default(
    redis.createClient({ url: "redis://localhost:6379" })
);

instance.on("init", () => {
    console.log("Connected!");
});
```

To use a username and password, use:

```javascript
const jsonRedis = require("json-redis");
const redis = require("redis");

const instance = jsonRedis.default(
    redis.createClient({ username: "MyUsername", password: "MyPassword" })
);

instance.on("init", () => {
    console.log("Connected!");
});
```

To set an object as a value:

```javascript
const jsonRedis = require("json-redis");

const instance = jsonRedis.default();

instance.on("init", async () => {
    console.log("Connected!");
    // Setting a key with an object value
    await instance.set("MyKey", { regular: "object" });
});
```

To get a value:

```javascript
const jsonRedis = require("json-redis");

const instance = jsonRedis.default();

instance.on("init", async () => {
    console.log("Connected!");
    // Getting the value of "MyKey"
    const obj = await instance.get("MyKey");
});
```
