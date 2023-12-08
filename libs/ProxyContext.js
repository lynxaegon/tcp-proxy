const Utils = require("./helpers/Utils");
const LocalSocket = require("./sockets/LocalSocket");

module.exports = class ProxyContext {
    constructor(proxy, local) {
        this.id = Utils.uuidv4();

        this.proxy = proxy;
        this.localSocket = new LocalSocket(this, local);
        this.remoteSocket = null;
        this.buffer = [];
        this.waitingForReply = false;
        this.lastCommand = false;
    }

    write(socket, data) {
        if(socket.getConnectionId() == this.localSocket.getConnectionId()) {
            // console.log("local:", data.toString("utf8"));
            // local -> remote
            if(!this.remoteSocket) {
                this.remoteSocket = this.proxy.getConnection(this);
                this.proxy.onContextNetworkChanged();
            }

            if(!this.remoteSocket) {
                return this.onClose(this.localSocket);
            }

            this.waitingForReply = true;
            this.lastCommand = data;
            if(!this.remoteSocket.connected) {
                if(this.buffer.length <= 0) {
                    this.remoteSocket.on("connect", () => {
                        this._flushBuffers();
                    });
                }
                this.buffer.push(data);
            } else {
                this._flushBuffers();
                this.remoteSocket.write(data);
            }
        } else {
            // remote -> local
            // console.log("remote:", data.toString("utf8"));

            if(data.toString().startsWith("-LOADING")) {
                return this.proxy.connectionManager.dropConnection(this.remoteSocket.getConnectionId());
            }

            this.waitingForReply = false;
            this.lastCommand = false;
            this.localSocket.write(data);
        }
    }

    onClose(socket) {
        if(this.isClosed) {
            return;
        }

        if(this.localSocket == socket) {
            this.isClosed = true;
            this.localSocket.close();
            if(this.remoteSocket) {
                this.remoteSocket.close();
            }
            this.localSocket = null;
            this.remoteSocket = null;
            this.proxy.onContextClosed(this);
            this.proxy.onContextNetworkChanged();
        } else if(this.remoteSocket == socket) {
            this.remoteSocket = null;
            // TODO: comment to support auto switch & heal
            this.localSocket.close();
        }
    }

    hasUpstream() {
        return this.remoteSocket != null;
    }

    disconnectRemote(id) {
        if(this.remoteSocket && this.remoteSocket.getConnectionId() == id) {
            this.remoteSocket.close();
            this.remoteSocket = null;
        }

        // TODO: uncomment to support auto switch & heal
        // if(this.waitingForReply) {
        //     this.buffer = [];
        //     this.write(this.localSocket, this.lastCommand);
        // }
    }

    _flushBuffers() {
        while(this.buffer.length > 0) {
            this.remoteSocket.write(this.buffer.shift());
        }
    }
}
