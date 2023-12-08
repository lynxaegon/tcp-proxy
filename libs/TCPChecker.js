const Redis = require("ioredis");
const RemoteSocket = require("./sockets/RemoteSocket");
const EventEmitter = require("events");
const Logger = require("./helpers/Logger");

module.exports = class TCPChecker extends EventEmitter {
    constructor(pool, config, checksConfig) {
        super();

        this.pool = pool;
        this.config = config;

        this.PUBSUB_CHANNEL = "tcp-proxy:" + this.pool + ":channel"
        this.MASTER_KEY = "tcp-proxy::" + this.pool + "::master"

        this._lastConnectLogTimestamp = 0;

        this.checksConfig = Object.assign({
            commands: [],
            currentIndex: 0,
            options: {
                timeout: 1000,
                interval: 1000
            }
        }, checksConfig);
        this._connect();
    }

    _connect() {
        if(Date.now() > this._lastConnectLogTimestamp + 1000) {
            Logger.log(this.pool, "tcp-checker", "connecting...", "[" + this.config.id + "]", this.config.host + ":" + this.config.port);
            this._lastConnectLogTimestamp = Date.now();
        }
        this.socket = new RemoteSocket(this, this.config);
        this.socket.on("connect", () => {
            this.connected = true
            this.checksConfig.currentIndex = 0;

            this.runChecks();
        });
    }

    write(socket, data) {
        clearTimeout(this._checkTimeout);
        data = data.toString("utf8");

        if (this.checksConfig.commands[this.checksConfig.currentIndex].expect != data) {
            return this.onClose();
        } else {
            this.checksConfig.currentIndex++;
            this.runChecks();
        }
    }

    onOnline() {
        if (this.online) {
            return;
        }

        this.redisSubscriber = new Redis(this.config);
        this.redisPublish = new Redis(this.config);

        this.redisSubscriber.subscribe(this.PUBSUB_CHANNEL);
        this.redisSubscriber.on("message", (channel, message) => {
            message = JSON.parse(message)
            if (message.type == "master-changed") {
                this.emit("master-changed", message.data)
            }
        });

        this.online = true;
        this.emit("online", this);

        if (this.firstStateChanged) {
            this.firstStateChanged();
        }
    }

    onOffline() {
        if (this.connected) {
            this.connected = false;
            this.socket.close();
            this.socket = null;
            if (this.redisSubscriber) {
                this.redisSubscriber.disconnect();
                this.redisSubscriber = null;
            }
            if (this.redisPublish) {
                this.redisPublish.disconnect();
                this.redisPublish = null;
            }
        }
        let wasOnline = this.online;
        this.online = false;

        if (this.firstStateChanged) {
            this.firstStateChanged();
            this.emit("offline", this);
        } else if (wasOnline) {
            this.emit("offline", this);
        }

        clearTimeout(this._nextCheck);
        clearTimeout(this._checkTimeout);
        clearTimeout(this._timer);
        this._timer = setTimeout(this._connect.bind(this), 10);

        if (this._kill) {
            clearTimeout(this._timer);
        }
    }

    runChecks() {
        if (this.checksConfig.currentIndex >= this.checksConfig.commands.length) {
            this.checksConfig.currentIndex = 0;
            this._nextCheck = setTimeout(() => {
                this.runChecks();
            }, this.checksConfig.options.interval);

            this.onOnline();
            return;
        }

        this.socket.write(this.checksConfig.commands[this.checksConfig.currentIndex].command);
        this._checkTimeout = setTimeout(() => {
            Logger.log(this.pool, "tcp-checker", "checks-timeout", this.checksConfig.currentIndex);
            this.onClose();
        }, this.checksConfig.options.timeout);
    }

    getConnectionId() {
        return this.config.id;
    }

    getClone(context) {
        return this.socket.clone(context);
    }

    setMaster() {
        if (this.redisPublish) {
            this.redisPublish.set(this.MASTER_KEY, this.getConnectionId());
            this.redisPublish.publish(this.PUBSUB_CHANNEL, JSON.stringify({
                type: "master-changed",
                data: this.getConnectionId()
            })).catch((err) => {
                Logger.log(this.pool, "tcp-checker", "set-master-error", err);
            });
        }
    }

    async isMaster() {
        if (this.redisPublish) {
            try {
                return await this.redisPublish.get(this.MASTER_KEY) == this.getConnectionId();
            }
            catch(err) {
                Logger.log(this.pool, "tcp-checker", "is-master-error", err);
            }
        }
        return false;
    }

    onClose() {
        this.onOffline();
    }

    waitForState() {
        return new Promise((resolve) => {
            this.firstStateChanged = () => {
                this.firstStateChanged = null;
                resolve();
            };
        });
    }

    destroy() {
        this._kill = true;
        this.socket.close();
    }
}