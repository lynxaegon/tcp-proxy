const Redis = require("ioredis");
const crypto = require('crypto');

const redis1 = new Redis({
    host: "localhost",
    port: 5555,
    commandTimeout: 500
});
(async () => {
    while(true) {
        let result = await(redis1.set("test", 1));
        if(result != "OK") {
            console.log(result);
        }
    }
})();