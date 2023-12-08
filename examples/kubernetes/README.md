# Kubernetes

### HA KeyDB (Redis drop-in replacement)
- We will be using KeyDB (https://docs.keydb.dev/) as our upstream Redis

    - KeyDB supports Active Replication (https://docs.keydb.dev/docs/active-rep)

### Topology    
- 2x **KeyDB** (Redis) pods _(with Active Replication)_
- 3x **TCPProxy** pods

The **KeyDBs** will be connected between each other using Active Replication and the **TCPProxies** will be used to load balance the traffic between the KeyDBs.

### Deploying the example
- Deploy the KeyDBs using the following command:
```
cd examples/kubernetes
kubectl apply -f keydb/*
```
- Deploy the TCPProxies using the following command:
```
cd examples/kubernetes
kubectl apply -f tcp-proxy/*
```

### Connecting to HA KeyDB
- To connect to the HA KeyDB, you have to connect to the TCPProxy service and port 6379


## That's it! 
You now have a HA KeyDB setup witch Active Replication and TCPProxy load balancing.
