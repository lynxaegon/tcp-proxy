const net = require("net");
const ProxyContext = require("./ProxyContext");
const ConnectionManager = require("./ConnectionManager");
const Logger = require("./helpers/Logger");
const Utils = require("./helpers/Utils");

module.exports = class TCPProxy {
    constructor(config) {
        this.pool = config.name;
        this.config = config;
        this.contexts = {};
        this.onContextNetworkChanged = Utils.throttle(this.onContextNetworkChanged.bind(this), 1000);
        this.logTrackings = Utils.throttle(this.logTrackings.bind(this), 1000);
    }

    logTrackings() {
        Logger.log(this.pool, "trackings:streams", [
            ["Upstreams:", this.connectionManager.getOnlineCount()].join(" "),
            ["Downstreams:", Object.keys(this.contexts).length].join(" "),
        ].join(" "));
    }

    start() {
        this.connectionManager = new ConnectionManager(this.pool, this.config.remote, this.config.checks);
        this.connectionManager.on("ready", (connectionID) => {
            this.server = net.createServer((local) => {
                this.onContextCreated(local);
            });

            this.server.listen(this.config.local.port, this.config.local.host || "0.0.0.0");
            Logger.log(this.pool, "proxy:started", this.config.local.port);
        });

        this.connectionManager.on("online", (connectionID) => {
            this.logTrackings();
        });

        this.connectionManager.on("offline", (connectionID) => {
            for (let id in this.contexts) {
                this.contexts[id].disconnectRemote(connectionID);
            }
            this.logTrackings();
        });

        this.connectionManager.start();
    }

    getConnection(context) {
        Logger.log(this.pool, "proxy:context:connection-clone", context.id);
        return this.connectionManager.getConnection(context);
    }

    onContextCreated(socket) {
        let context = new ProxyContext(this, socket);
        this.contexts[context.id] = context;
        Logger.log(this.pool, "proxy:context:created", context.id);
        this.logTrackings();
    }

    onContextClosed(context) {
        delete this.contexts[context.id];
        Logger.log(this.pool, "proxy:context:closed", context.id);
        this.logTrackings();
    }

    onContextNetworkChanged() {
        let upstreamInfo = {};
        let totalUpstreams = 0;
        Object.values(this.contexts).map(c => {
            if (!c.hasUpstream())
                return;

            let upstream = c.remoteSocket;
            totalUpstreams++;
            if (!upstreamInfo[upstream.getConnectionId()]) {
                upstreamInfo[upstream.getConnectionId()] = 0;
            }
            upstreamInfo[upstream.getConnectionId()]++;
        });

        Logger.log(this.pool, "trackings:context", [
            ["Proxied:", totalUpstreams].join(" "),
            ...Object.keys(upstreamInfo).map(id => {
                return "'" + id + "'" + ": " + upstreamInfo[id];
            })
        ].join(", "));
    }

    stop() {
        this.server.close();

        this.connectionManager.stop();

        for (let key in this.contexts) {
            this.contexts[key].onClose();
        }
        this.contexts = {};
    }
}