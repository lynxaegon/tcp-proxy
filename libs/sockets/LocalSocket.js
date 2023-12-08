const BaseSocket = require("./BaseSocket");

module.exports = class LocalSocket extends BaseSocket {
    constructor(context, socket) {
        super(context);

        this.socket = socket;
        this.setup();
    }
}