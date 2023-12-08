const Utils = require("../helpers/Utils");
const EventEmitter = require("events");

module.exports = class BaseSocket extends EventEmitter {
    constructor(context) {
        super();
        this.id = Utils.uuidv4();

        this.context = context;
        this.socket = null;
    }

    getConnectionId() {
        return this.id;
    }

    clone(context) {
        throw new Error("Not implemented!");
    }

    setup() {
        this.socket.on("connect", () => {
            this.onConnect();
        });

        this.socket.on("data", (data) => {
            this.onData(data);
        });

        this.socket.on("close", (err) => {
            this.close(err);
        });

        this.socket.on("error", (err) => {
            this.close(err);
        });
    }

    onConnect() {
        this.connected = true;
        this.emit("connect");
    }

    write(data) {
        this.socket.write(data);
    }

    onData(data) {
        this.context.write(this, data);
    }

    onClose(err) {
        this.emit("close", err);
    }

    close(err) {
        this.connected = false;
        if(!this.isClosed) {
            this.isClosed = true;
            if(this.socket) {
                this.socket.destroy();
            }
            this.context.onClose(this);
            this.onClose(err);
        }
    }
}