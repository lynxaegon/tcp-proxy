const Redis = require("ioredis");
const crypto = require('crypto');

const redis1 = new Redis({
    host: "127.0.0.1",
    port: 6666
});
const redis2 = new Redis({
    host: "127.0.0.1",
    port: 7777
});

(async () => {
    for(let i = 0; i < 1000; i++) {
        await redis1.set("key" + i, crypto.randomBytes(1024 * 1024));
    }
    redis1.disconnect();
    redis2.disconnect();
})();