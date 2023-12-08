const TcpProxy = require("./libs/TCPProxy");
const fs = require("fs");

const config = JSON.parse(fs.readFileSync("./config.json", "utf8"));
for(let pool of config.pools) {
    (new TcpProxy(pool)).start();
}