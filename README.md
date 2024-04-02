
## Description

Tangocrypto Cardano API

## Installation

```bash
$ npm install
```

## Setting up
Create a new `.env` in the root directory of the project. For example:

```
DB_HOST=db
DB_PORT=5432
DB_NAME=testnet_preprod
DB_USER=db_user
DB_PWD=db_password
DB_DEBUG=false
NETWORK=testnet
REDIS_HOST=redis
REDIS_PORT=6379
SCYLLA_CONTACT_POINTS=["scylladb"]
SCYLLA_KEYSPACE="cardanodb"
SCYLLA_LOCAL_DATA_CENTER="datacenter1"
THROTTLE_LIMIT=10
THROTTLE_INTERVAL=1000
```
During development, you can utilize the provided data for simplicity. The API utilizes PostgreSQL for Cardano data, Redis for rate limiting, and ScyllaDB for accounts and authentication.

![Cardano-API](cardano-api.jpg)


By default we'll working with testnet so `NETWORK=testnet`. You can switch to mainnet as well, just make sure the postgres db is using mainnet data as well. `THROTTLE_LIMIT` amd `THROTTLE_INTERVAL` are just default values for rate limit in case user doesn't specified it.

### ScyllaDB

These are the env variables related to scylladb which holds the data for the customers inside the API:

```
SCYLLA_CONTACT_POINTS=["scylladb"]
SCYLLA_KEYSPACE="cardanodb"
SCYLLA_LOCAL_DATA_CENTER="datacenter1"
```

#### Run scylladb container using a local storage for better performance

1. Add volume dir (local machine):

```bash
sudo mkdir -p /var/lib/scylla/data /var/lib/scylla/commitlog /var/lib/scylla/hints /var/lib/scylla/view_hints
```

2. Add permission

```bash
sudo chmod -R 777 /var/lib/scylla
```

#### Populate the database:

```bash
docker exec -it scylladb cqlsh

// copy content inside file seeds (src/db/scylla/seeds)

```

This command will create two users with their corresponding rate limit configuration and applications. You'll need the `account-id` and `api-key` in order to query the API's endpoints (more on that bellow).

#### Run docker container:

```bash
docker compose up scylladb
```

#### Check container status:

```bash
docker exec -it scylladb nodetool status
```

#### Clear the database (this will remove everything!):

```bash
docker exec -it scylladb nodetool clearsnapshot cardanodb
```


## Running the app

```bash
docker compose up cardano-api
```

### Using the API
Once you have the api running and `redis`, `scylladb` and `postgres` containers running and setted up as well everything well be ready to start using the endpoints.
Endpoints has this structure (e.g `curl`):

```
curl --location 'http://localhost:3000/{{account-id}}/addresses/addr_test1qp096kfuh3lzgjr6suz9w89lgwee9kwu765cmpjmzylckywdlts73fm59h9svf05xnxctt2fhslzqffdsfhl2hyg49asd4lwnt/utxos?size=50' \
--header 'x-api-key: {{x-api-key}}'
```
Where `account-id` is corresponding to the app_id on table `applications` and `x-api-key` is your `user_id` on table `subscriptions` (both tables on `scylladb`, which was populated above when setting up syclladb).

### Rate Limit
Here you can find seed credentials with their corresponding rate limits:

|  account-id | x-api-key  | |
|---|---|--|
| 6e2ab6cc28d943f48a84d92ad9b5392d  | 8120536a5efc478b92809f8f1987a76e  | 10 req/sec |
| 00000000000000000000000000000000  | 11111111111111111111111111111111  | 3 req/min  |


## Test

```bash
# unit tests
$ npm run test
```
