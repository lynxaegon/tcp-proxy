const TCPChecker = require("./TCPChecker");
const Logger = require("./helpers/Logger");
const EventEmitter = require("events");

module.exports = class ConnectionManager extends EventEmitter {
    constructor(pool, connections, checks) {
        super();

        this.pool = pool;
        this.connections = connections;
        this.checks = checks;
        this.isReady = false;

        let index = 1;
        for (let remote of this.connections) {
            if(!remote.id) {
                remote.id = "remote-" + index;
                index++;
            }
        }
    }

    start() {
        let promises = [];
        for (let remote of this.connections) {
            remote.socket = new TCPChecker(this.pool, remote, this.checks);
            promises.push(remote.socket.waitForState());
            remote.socket.on("online", (item) => {
                this.onOnline(item.getConnectionId(), item.config);
                // check if master is connected, if not, change master
                if(!this.connections[0].socket.connected || this.connections[0].id == item.getConnectionId()) {
                    this._changeToMaster(item.getConnectionId());
                }
            });
            remote.socket.on("offline", (item) => {
                // we presume that there are only 2 connections
                let offlineId = remote.socket.getConnectionId();
                if(this.connections[0].id == offlineId) {
                    // the master went offline, so we swap masters
                    this._changeToMaster(this.connections[1].id);
                }
                this.onOffline(offlineId, item.config);
            });
            remote.socket.on("master-changed", (data) => {
                // we presume that there are only 2 connections
                if(this.connections[0].id != data) {
                    let currentMasterId = this.connections[0].id;
                    this.emit("offline", currentMasterId);
                    Logger.log(this.pool, "connection-manager:master-changed",
                        "from:", currentMasterId,
                        "to:", data,
                    );
                    this._changeToMaster(data, true);
                }
            });
        }

        Promise.all(promises).then(async () => {
            let connections = (await Promise.all(this.connections.map(async item => {
                return {
                    master: await item.socket.isMaster(),
                    connection: item
                }
            })));
            if(connections.filter(item => item.master).length == 0) {
                connections[0].master = true;
                connections[0].connection.socket.setMaster();
            }
            this.connections = connections
                .sort((a, b) => b.master - a.master)
                .map(item => item.connection)

            this.onReady();
            this.onOrderChanged(true);
        });
    }

    dropConnection(connectionID) {
        Logger.log(this.pool, "connection-manager:drop", connectionID);
        this.connections.find(item => item.id == connectionID).socket.onClose();
    }

    stop() {
        for (let remote of this.connections) {
            remote.socket.destroy();
        }
    }

    getConnection(context) {
        for (let item of this.connections) {
            if (!item.socket.online) {
                continue;
            }

            return item.socket.getClone(context);
        }

        return null;
    }

    getOnlineCount() {
        return this.connections.filter(item => item.socket.online).length;
    }

    onReady() {
        this.isReady = true;
        this.emit("ready");
    }

    onOnline(connectionID, item) {
        Logger.log(this.pool, "connection-manager:online", item.host + ":" + item.port + ")");
        this.emit("online", connectionID);
    }

    onOffline(connectionID, item) {
        Logger.log(this.pool, "connection-manager:offline", item.host + ":" + item.port + ")");
        this.emit("offline", connectionID);
    }

    onOrderChanged(fromMesh) {
        Logger.log(this.pool, "connection-manager:order", this.connections.map(item => item.id), (fromMesh ? "Mesh Update" : ""));
        if(this.isReady) {
            this.connections[0].socket.setMaster();
        }
    }

    _changeToMaster(masterID, fromMesh) {
        let masterIndex = this.connections.findIndex(item => item.id == masterID);
        this.connections.unshift(this.connections.splice(masterIndex, 1)[0]);
        this.onOrderChanged(fromMesh);
    }
}