let ENABLED = true;
try {
    require.resolve("debug");
} catch(e) {
    ENABLED = false;
}
let loggers = {};
module.exports = class Logger {
    static log(pool, tag, ...args) {
        if(!ENABLED) {
            return;
        }

        tag = pool + "::" + tag;
        if(!loggers[tag]) {
            loggers[tag] = require("debug")(tag);
        }
        loggers[tag](...args);
    }
}