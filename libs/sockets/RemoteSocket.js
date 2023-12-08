const net = require("net");
const BaseSocket = require("./BaseSocket");

module.exports = class RemoteSocket extends BaseSocket {
    constructor(context, config) {
        super(context);

        this.config = config;
        this.socket = new net.Socket();
        this.socket.connect(this.config.port, this.config.host);
        this.socket.setTimeout(this.config.connectionTimeout || 2500, () => {
            this.close();
        });
        this.setup();
    }

    getConnectionId() {
        return this.config.id;
    }

    clone(context) {
        return new RemoteSocket(context, this.config);
    }

    onConnect() {
        super.onConnect();

        this.socket.setTimeout(0);
    }
}