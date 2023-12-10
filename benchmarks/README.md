# Benchmarks

### Test Setup
- 2x KeyDB instance
- 1x TCPProxy instance
- Tests were ran on a MacBook Pro M1 Max 2021 32GB
- Everything was ran in Docker Containers
- During the TCPProxy test, from time to time a KeyDB instance was stopped to test the failover

### Quick benchmark comparison
| Test             | KeyDB        | TCPProxy     | Difference |
|------------------|--------------|--------------|------------|
| PING_INLINE      | 22326.41 rps | 20312.82 rps | -9.01%     |
| PING_MBULK       | 20990.76 rps | 20462.45 rps | -2.52%     |
| SET              | 19880.71 rps | 18066.85 rps | -9.12%     |
| GET              | 21299.25 rps | 19665.68 rps | -7.66%     |
| INCR             | 18825.30 rps | 17921.15 rps | -4.81%     |
| LPUSH            | 20173.49 rps | 17692.85 rps | -12.28%    |
| RPUSH            | 19409.94 rps | 18670.65 rps | -3.80%     |
| LPOP             | 18932.22 rps | 18158.71 rps | -4.09%     |
| RPOP             | 19798.06 rps | 17590.15 rps | -11.16%    |
| SADD             | 20977.55 rps | 20341.74 rps | -3.02%     |
| HSET             | 19920.32 rps | 18208.30 rps | -8.59%     |
| SPOP             | 21542.44 rps | 19447.69 rps | -9.73%     |
| ZADD             | 21715.53 rps | 19561.81 rps | -9.92%     |
| ZPOPMIN          | 21408.69 rps | 19868.87 rps | -7.20%     |
| LRANGE_100       | 18782.87 rps | 17370.16 rps | -7.52%     |
| LRANGE_300       | 14166.31 rps | 14291.84 rps | 0.88%      |
| LRANGE_500       | 12666.24 rps | 11590.17 rps | -8.49%     |
| LRANGE_600       | 12272.95 rps | 10738.83 rps | -12.49%    |
| MSET (10 keys)   | 17708.52 rps | 16477.18 rps | -6.94%     |
| MGET (1 keys)    | 19519.81 rps | 19924.29 rps | 2.07%      |
| MGET (101 keys)  | 14238.93 rps | 14675.67 rps | 3.06%      |
| MGET (201 keys)  | 11370.10 rps | 10893.25 rps | -4.20%     |
| MGET (301 keys)  | 9838.65 rps | 9279.88 rps | -5.68%     |
| MGET (401 keys)  | 8336.11 rps | 8132.06 rps | -2.44%     |
| MGET (501 keys)  | 7337.30 rps | 7276.43 rps | -0.83%     |
| MGET (601 keys)  | 6428.80 rps | 6445.79 rps | 0.26%      |
| MGET (701 keys)  | 5857.20 rps | 5830.56 rps | -0.46%     |
| MGET (801 keys)  | 5345.31 rps | 5202.37 rps | -2.67%     |
| MGET (901 keys)  | 4442.27 rps | 4455.73 rps | 0.30%      |
| MGET (1001 keys) | 4187.25 rps | 4235.13 rps | 1.14%      |
| HMGET (1 keys)   | 20639.84 rps | 20470.83 rps | -0.82%     |
| HMGET (101 keys) | 15913.43 rps | 14490.65 rps | -9.00%     |
| HMGET (201 keys) | 11738.47 rps | 11117.29 rps | -5.29%     |
| HMGET (301 keys) | 10517.46 rps | 9740.89 rps | -7.40%     |
| HMGET (401 keys) | 8556.52 rps | 8294.62 rps | -3.06%     |
| HMGET (501 keys) | 7632.42 rps | 7358.35 rps | -3.58%     |
| HMGET (601 keys) | 6803.18 rps | 6341.96 rps | -6.78%     |
| HMGET (701 keys) | 6190.03 rps | 6015.40 rps | -2.82%     |
| HMGET (801 keys) | 5554.94 rps | 5407.16 rps | -2.66%     |
| HMGET (901 keys) | 4710.09 rps | 4417.55 rps | -6.23%     |
| HMGET (1001 keys)| 4403.93 rps | 4150.41 rps | -5.75%     |


#### Direct connection to a 1x KeyDB instance
```bash
root@decca6a51d75:/data# keydb-benchmark -h host.docker.internal -p 7777 -q

PING_INLINE: 22326.41 requests per second, p50=1.911 msec
PING_MBULK: 20990.76 requests per second, p50=1.927 msec
SET: 19880.71 requests per second, p50=2.103 msec
GET: 21299.25 requests per second, p50=1.911 msec
INCR: 18825.30 requests per second, p50=2.151 msec
LPUSH: 20173.49 requests per second, p50=2.111 msec
RPUSH: 19409.94 requests per second, p50=2.135 msec
LPOP: 18932.22 requests per second, p50=2.143 msec
RPOP: 19798.06 requests per second, p50=2.095 msec
SADD: 20977.55 requests per second, p50=1.903 msec
HSET: 19920.32 requests per second, p50=2.119 msec
SPOP: 21542.44 requests per second, p50=1.895 msec
ZADD: 21715.53 requests per second, p50=1.879 msec
ZPOPMIN: 21408.69 requests per second, p50=1.887 msec
LPUSH (needed to benchmark LRANGE): 18761.73 requests per second, p50=2.159 msec
LRANGE_100 (first 100 elements): 18782.87 requests per second, p50=2.135 msec
LRANGE_300 (first 300 elements): 14166.31 requests per second, p50=2.511 msec
LRANGE_500 (first 500 elements): 12666.24 requests per second, p50=2.839 msec
LRANGE_600 (first 600 elements): 12272.95 requests per second, p50=2.967 msec
MSET (10 keys): 17708.52 requests per second, p50=2.303 msec
MGET (1 keys): 19519.81 requests per second, p50=2.047 msec
MGET (101 keys): 14238.93 requests per second, p50=2.487 msec
MGET (201 keys): 11370.10 requests per second, p50=3.063 msec
MGET (301 keys): 9838.65 requests per second, p50=3.471 msec
MGET (401 keys): 8336.11 requests per second, p50=4.255 msec
MGET (501 keys): 7337.30 requests per second, p50=4.567 msec
MGET (601 keys): 6428.80 requests per second, p50=5.119 msec
MGET (701 keys): 5857.20 requests per second, p50=5.767 msec
MGET (801 keys): 5345.31 requests per second, p50=6.367 msec
MGET (901 keys): 4442.27 requests per second, p50=7.215 msec
MGET (1001 keys): 4187.25 requests per second, p50=7.927 msec
MSET (10 keys): 17809.44 requests per second, p50=2.239 msec
HMGET (1 keys): 20639.84 requests per second, p50=1.943 msec
HMGET (101 keys): 15913.43 requests per second, p50=2.343 msec
HMGET (201 keys): 11738.47 requests per second, p50=2.903 msec
HMGET (301 keys): 10517.46 requests per second, p50=3.271 msec
HMGET (401 keys): 8556.52 requests per second, p50=3.783 msec
HMGET (501 keys): 7632.42 requests per second, p50=4.183 msec
HMGET (601 keys): 6803.18 requests per second, p50=4.815 msec
HMGET (701 keys): 6190.03 requests per second, p50=5.159 msec
HMGET (801 keys): 5554.94 requests per second, p50=5.815 msec
HMGET (901 keys): 4710.09 requests per second, p50=6.511 msec
HMGET (1001 keys): 4403.93 requests per second, p50=6.759 msec
```

#### Connection through TCPProxy to 2x KeyDB instances
```bash
root@decca6a51d75:/data# keydb-benchmark -h host.docker.internal -p 5555 -q

PING_INLINE: 20312.82 requests per second, p50=2.063 msec
PING_MBULK: 20462.45 requests per second, p50=2.071 msec
SET: 18066.85 requests per second, p50=2.255 msec
GET: 19665.68 requests per second, p50=2.111 msec
INCR: 17921.15 requests per second, p50=2.287 msec
LPUSH: 17692.85 requests per second, p50=2.335 msec
RPUSH: 18670.65 requests per second, p50=2.279 msec
LPOP: 18158.71 requests per second, p50=2.311 msec
RPOP: 17590.15 requests per second, p50=2.335 msec
SADD: 20341.74 requests per second, p50=2.071 msec
HSET: 18208.30 requests per second, p50=2.271 msec
SPOP: 19447.69 requests per second, p50=2.119 msec
ZADD: 19561.81 requests per second, p50=2.111 msec
ZPOPMIN: 19868.87 requests per second, p50=2.071 msec
LPUSH (needed to benchmark LRANGE): 18804.06 requests per second, p50=2.255 msec
LRANGE_100 (first 100 elements): 17370.16 requests per second, p50=2.271 msec
LRANGE_300 (first 300 elements): 14291.84 requests per second, p50=2.639 msec
LRANGE_500 (first 500 elements): 11590.17 requests per second, p50=3.151 msec
LRANGE_600 (first 600 elements): 10738.83 requests per second, p50=3.255 msec
MSET (10 keys): 16477.18 requests per second, p50=2.423 msec
MGET (1 keys): 19924.29 requests per second, p50=2.063 msec
MGET (101 keys): 14675.67 requests per second, p50=2.607 msec
MGET (201 keys): 10893.25 requests per second, p50=3.207 msec
MGET (301 keys): 9279.88 requests per second, p50=3.703 msec
MGET (401 keys): 8132.06 requests per second, p50=4.135 msec
MGET (501 keys): 7276.43 requests per second, p50=4.535 msec
MGET (601 keys): 6445.79 requests per second, p50=5.039 msec
MGET (701 keys): 5830.56 requests per second, p50=5.519 msec
MGET (801 keys): 5202.37 requests per second, p50=6.279 msec
MGET (901 keys): 4455.73 requests per second, p50=7.135 msec
MGET (1001 keys): 4235.13 requests per second, p50=7.775 msec
MSET (10 keys): 16597.51 requests per second, p50=2.415 msec
HMGET (1 keys): 20470.83 requests per second, p50=2.031 msec
HMGET (101 keys): 14490.65 requests per second, p50=2.575 msec
HMGET (201 keys): 11117.29 requests per second, p50=3.119 msec
HMGET (301 keys): 9740.89 requests per second, p50=3.455 msec
HMGET (401 keys): 8294.62 requests per second, p50=3.999 msec
HMGET (501 keys): 7358.35 requests per second, p50=4.471 msec
HMGET (601 keys): 6341.96 requests per second, p50=4.991 msec
HMGET (701 keys): 6015.40 requests per second, p50=5.463 msec
HMGET (801 keys): 5407.16 requests per second, p50=5.935 msec
HMGET (901 keys): 4417.55 requests per second, p50=7.047 msec
HMGET (1001 keys): 4150.41 requests per second, p50=7.591 msec
```