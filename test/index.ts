import RedisJSON from "../min";

const client = RedisJSON();

client.on("init", () => {
    console.log("Initialized.");
});