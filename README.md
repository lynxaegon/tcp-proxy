# TCP Proxy 
This is a simple tcp proxy server that can be used to proxy any tcp connection. It can be used to proxy keydb, redis, memcached, or any other tcp connection

### Production Ready
Yes, it's **production** ready and it's being used to create a **HA <a href="https://keydb.dev">KeyDB</a>** (Redis drop-in replacement)

### Benchmarks
The performance penalty is **~7%** compared to a direct connection to a KeyDB instance

You can see the benchmarks <a href="benchmarks">here</a>

### Usage
- Check the <a href="examples/kubernetes">**examples**</a> folder for a **kubernetes** setup of a **HA <a href="https://keydb.dev">KeyDB</a>**

- You can also see an example config <a href="config.json.example">here</a> 
  - It's **multitenant** so you can add as many **pools** and **remotes** as you want
  - Each **pool** is a separate load balancer between the defined **remotes**


**Important**: 
- The **TCPProxy** uses **primary**/**secondary** load balancing, it doesn't do round-robin between remotes. 
  - It will always try to use the **primary** remote and if it's down it will switch to the **secondary** remote. If you have more than 2 remotes, when the **primary** is down, it will connect to the next available remote.
- You need at least 2 remotes defined, otherwise it won't work

### How it works
- It starts a **TCPChecker** service for all defined remotes in the config
- The **TCPChecker** is responsible for checking if the remote is up or down
- If the **remote** is down it automatically switches to the other defined **remote**
- In case of **KeyDB/Redis** if the remote returns "Loading Keys" it will mark the **remote** as offline and switch to the other one
- Each connection has a separate **ProxyContext** which is responsible for handling the upstream/downstream connections

This setup is used to create a **HA <a href="https://keydb.dev">KeyDB</a>** (Redis drop-in replacement) with **Active Replication**

<a name="license"></a>
## License

MIT
