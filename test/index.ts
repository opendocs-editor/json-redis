import RedisJSON from "../src";

const client = RedisJSON();

client.on("init", () => {
    console.log("Initialized.");
});