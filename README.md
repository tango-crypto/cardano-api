
## Tangocrypto Cardano API

The Tangocrypto API serves as a backend solution built in NestJS, enabling developers to seamlessly interact with the Cardano network. With just a few simple commands, users can effortlessly deploy all essential components, laying the foundation for developing Cardano-powered applications.

## System Requirements
The system requirements for cardano-db-sync (with both db-sync and the node running on the same machine are:
- Any major Linux distribution (such as Debian, Ubuntu, RHEL, CentOS, Arch, etc.) or macOS.
- At least 16 GB of RAM for testing and 32 GB or more for production. 
- A minimum of 4 CPU cores.
- 320 gigabytes or more of disk storage, preferably SSDs.

## Getting Started
Create a new `.env` in the base directory of the project `cardano-api/.env`. For example:

```
DB_HOST=db
DB_PORT=5432
DB_NAME=cexplorer
DB_USER=postgres
DB_PWD=db_password
DB_DEBUG=false
NETWORK=preprod
REDIS_HOST=redis
REDIS_PORT=6379
OGMIOS_HOST=135.181.203.83
OGMIOS_PORT=1337
SCYLLA_CONTACT_POINTS=["scylladb"]
SCYLLA_KEYSPACE="cardanodb"
SCYLLA_LOCAL_DATA_CENTER="datacenter1"
THROTTLE_LIMIT=10
THROTTLE_INTERVAL=1000
```
## Installation
To install node dependencies:

```bash
$ npm install
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

#### Run Scylladb container using a local storage for better performance

1. Add volume directories in the local machine:

```bash
sudo mkdir -p /var/lib/scylla/data /var/lib/scylla/commitlog /var/lib/scylla/hints /var/lib/scylla/view_hints
```

2. Add filesystem permissions

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


## Running the API using Docker
To start the Cardano API run the following command:

```bash
docker compose up cardano-api
```

### Testing the API

Once the API is up and running, and the Redis, Scylladb, and Postgres containers are also running and configured, everything should be ready to start using the endpoints.

The API endpoints have the following structure (e.g `curl`):

```
curl --location 'http://localhost:3000/6e2ab6cc28d943f48a84d92ad9b5392d/blocks/latest'  --header 'x-api-key: 8120536a5efc478b92809f8f1987a76e' 
```
Returns
```
{
  "hash": "9c4b49c8a49b8031aeb03e3a47049a0bad3b49e376aeb3ffb5f61260b9f5e4af",
  "epoch_no": 67,
  "slot_no": 27689137,
  "epoch_slot_no": 386737,
  "block_no": 907742,
  "previous_block": 907741,
  "slot_leader": "pool1n84mel6x3e8sp0jjgmepme0zmv8gkw8chs98sqwxtruvkhhcsg8",
  "out_sum": 10146206,
  "fees": 171661,
  "confirmations": 1,
  "size": 238,
  "time": "2023-05-06T11:25:37.000Z",
  "tx_count": 1,
  "vrf_key": "vrf_vk126lnp0mw7nnpvhahfneffrk530lseu677pj7d3lg6xg8kj0vcgwslmu09l",
  "op_cert": "1f07eefb8caafcf96b304fb59d20d7ccba34e0ed97f72503cff281e6a4e911aa"
}
```
Where `account-id` is corresponding to the app_id on table `applications` and `x-api-key` is your `user_id` on table `subscriptions` (both tables on `scylladb`, which was populated above when setting up syclladb).

### Rate Limit
Here you can find seed credentials with their corresponding rate limits:

|  account-id | x-api-key  | |
|---|---|--|
| 6e2ab6cc28d943f48a84d92ad9b5392d  | 8120536a5efc478b92809f8f1987a76e  | 10 req/sec |
| 00000000000000000000000000000000  | 11111111111111111111111111111111  | 3 req/min  |

## Endpoints
**Addresses**

- [x]  Retrieve address summary

```jsx
curl --location 'http://localhost:3000/6e2ab6cc28d943f48a84d92ad9b5392d/addresses/addr_test1qzzydcdt76dqhamjml4rzhxpc9kmt9n0he23xnnvt4eaq60456mq7rvnr9gheuzg2kqnap6czeuz33g3z6ma2vg7v5equdunr9' \
--header 'x-api-key: 8120536a5efc478b92809f8f1987a76e'
```

- [x]  List address coin selection

```jsx
// without assets
curl --location 'http://localhost:3000/6e2ab6cc28d943f48a84d92ad9b5392d/addresses/addr_test1qzzydcdt76dqhamjml4rzhxpc9kmt9n0he23xnnvt4eaq60456mq7rvnr9gheuzg2kqnap6czeuz33g3z6ma2vg7v5equdunr9/coinselection' \
--header 'x-api-key: 8120536a5efc478b92809f8f1987a76e' \
--header 'Content-Type: application/json' \
--data '{
    "value": {
        "lovelace": 10000000
       
    }
}'

// with assets
curl --location 'http://localhost:3000/6e2ab6cc28d943f48a84d92ad9b5392d/addresses/addr_test1wqlcn3pks3xdptxjw9pqrqtcx6ev694sstsruw3phd57ttg0lh0zq/coinselection' \
--header 'x-api-key: 8120536a5efc478b92809f8f1987a76e' \
--header 'Content-Type: application/json' \
--data '{
    "value": {
        "lovelace": 10000000,
        "assets": [
            {
                "policy_id": "2b556df9f37c04ef31b8f7f581c4e48174adcf5041e8e52497d81556",
                "asset_name": "4f7261636c6546656564",
                "quantity": 1
            },
            {
                "policy_id": "c6f192a236596e2bbaac5900d67e9700dec7c77d9da626c98e0ab2ac",
                "asset_name": "5061796d656e74546f6b656e",
                "quantity": 10001
            }
        ]
    }
}'
```

- [x]  List address assets

```jsx
curl --location 'http://localhost:3000/6e2ab6cc28d943f48a84d92ad9b5392d/addresses/addr_test1wqlcn3pks3xdptxjw9pqrqtcx6ev694sstsruw3phd57ttg0lh0zq/assets' \
--header 'x-api-key: 8120536a5efc478b92809f8f1987a76e'
```

- [x]  List address asset UTXOs

```jsx
curl --location 'http://localhost:3000/6e2ab6cc28d943f48a84d92ad9b5392d/addresses/addr_test1qzzydcdt76dqhamjml4rzhxpc9kmt9n0he23xnnvt4eaq60456mq7rvnr9gheuzg2kqnap6czeuz33g3z6ma2vg7v5equdunr9/utxos' \
--header 'x-api-key: 8120536a5efc478b92809f8f1987a76e'
```

- [x]  List address transactions

```jsx
curl --location 'http://localhost:3000/6e2ab6cc28d943f48a84d92ad9b5392d/addresses/addr_test1qzzydcdt76dqhamjml4rzhxpc9kmt9n0he23xnnvt4eaq60456mq7rvnr9gheuzg2kqnap6czeuz33g3z6ma2vg7v5equdunr9/transactions' \
--header 'x-api-key: 8120536a5efc478b92809f8f1987a76e'
```

**Transactions**

- [x]  Retrieve Transaction

```jsx
curl --location 'http://localhost:3000/6e2ab6cc28d943f48a84d92ad9b5392d/transactions/ab252a49d71932369e04ce53426045b5695e6af164da95c75da61f21abcbeacc' \
--header 'x-api-key: 8120536a5efc478b92809f8f1987a76e'
```

- [x]  List transaction UTXOs

```jsx
curl --location 'http://localhost:3000/6e2ab6cc28d943f48a84d92ad9b5392d/transactions/ab252a49d71932369e04ce53426045b5695e6af164da95c75da61f21abcbeacc/utxos' \
--header 'x-api-key: 8120536a5efc478b92809f8f1987a76e'
```

- [x]  List transaction scripts

```jsx
curl --location 'http://localhost:3000/6e2ab6cc28d943f48a84d92ad9b5392d/transactions/ab252a49d71932369e04ce53426045b5695e6af164da95c75da61f21abcbeacc/scripts' \
--header 'x-api-key: 8120536a5efc478b92809f8f1987a76e'
```

- [x]  List transaction collaterals

```jsx
curl --location 'http://localhost:3000/6e2ab6cc28d943f48a84d92ad9b5392d/transactions/ab252a49d71932369e04ce53426045b5695e6af164da95c75da61f21abcbeacc/collaterals' \
--header 'x-api-key: 8120536a5efc478b92809f8f1987a76e'
```

- [x]  List transaction assets mints

```jsx
curl --location 'http://localhost:3000/6e2ab6cc28d943f48a84d92ad9b5392d/transactions/e9225a5e601688eedaf8dd25a1b1dbd6614a2d84fb5f600731ebd0b53de564ca/mints' \
--header 'x-api-key: 8120536a5efc478b92809f8f1987a76e'
```

- [x]  Retrieve transaction metadata

```jsx
curl --location 'http://localhost:3000/6e2ab6cc28d943f48a84d92ad9b5392d/transactions/a6ea1b7f2c96db8f097534a17f45cfa8934c9e9d70a0737b0ad90d7549de2724/metadata' \
--header 'x-api-key: 8120536a5efc478b92809f8f1987a76e'
```

- [x]  Submit a transaction

```jsx
curl --location 'http://localhost:3000/6e2ab6cc28d943f48a84d92ad9b5392d/transactions/submit' \
--header 'x-api-key: 8120536a5efc478b92809f8f1987a76e' \
--header 'Content-Type: application/json' \
--data '{
    "tx":"84a30081825820baf7ccd9c47955b4db25afbc0f781adf43e4b183c2fb6dff6d44926396cca89f000182825839008ba1deb634d76d24d45221676e9ba23da18cce8d24c093f86b9634117ccfa7551e4d87cd916bc0efdd0174ca985c2cd1da02191e0bb01fd51a000f424082581d60d9242340b47698d25a0a6340e5de4456ade56bc7756c4accf6b74c391a05e4131b021a00028ba5a10081825820801adee54bc0fd65a7e34abc8b78f4aac8feff56a13df8b313e11b258fa59e9c5840c274141f19231ca4430b7a488180c62f0507e25d74728caa0c06c364c928b951badf0bdde2261684fd2540e4e97e7d8f63ceefcc00c21611c6d15a3034d7a901f5f6"
}'
```

- [x]  Evaluate a transaction

```jsx
curl --location 'http://localhost:3000/6e2ab6cc28d943f48a84d92ad9b5392d/transactions/evaluate' \
--header 'x-api-key: 8120536a5efc478b92809f8f1987a76e' \
--header 'Content-Type: application/json' \
--data '{
    "tx": "84aa00818258202e51b691eb1ce6c6d1b8bc8212e4ebe780a6fa4533f1dad41f276e5e39f16467000182a300581d702845076ede34cac7446e4e3637714b39a4dfcc5f91549213fd6aba6f01821a001da902a1581c666d8f819aefab86f165dd249abd6dceb24a138e66423a72f02aba95a151536f756c626f756e64546573742330303101028201d81858c1d8799f58209ebffc56dfcbcff39113378280d535430f768b0821bbd293f7a4546bb8d73fa8581c3dce7844f36b23b8c3f90afba40aa188e7f1d3f6e8acd1d544ed1da946497373756564d8799fa158383636366438663831396165666162383666313635646432343961626436646365623234613133386536363432336137326630326162613935a151536f756c626f756e645465737423303031a2446e616d6551536f756c626f756e64546573742330303143666f6f4362617201d87a80ffff82581d603dce7844f36b23b8c3f90afba40aa188e7f1d3f6e8acd1d544ed1da91b0000000251da073d021a0004aaf8031a02f7801709a1581c666d8f819aefab86f165dd249abd6dceb24a138e66423a72f02aba95a151536f756c626f756e645465737423303031010b58203642508d09dc8061e620b2b3f5aa14c7609042c4c281348928b0da5b5f66f9160d818258202e51b691eb1ce6c6d1b8bc8212e4ebe780a6fa4533f1dad41f276e5e39f16467000e81581c3dce7844f36b23b8c3f90afba40aa188e7f1d3f6e8acd1d544ed1da91082581d603dce7844f36b23b8c3f90afba40aa188e7f1d3f6e8acd1d544ed1da91b0000000251f55ac3111a00070074a30081825820def8fec9a568b0cbecdefc7e2ed95d8c95ddc9e6414cbd4ba18b605dc4067c995840c6980296d9b1cf50e62946a1647471f242531346a53e33e59e865fcd62fde6186a0a689696356289e5c7444e5126f147161f90b1260feba508d535486839ab0d0581840100d8799f46497373756564ff821a000298be1a04fb9bda068159091c590919010000332323232323232323222232533300732323232333332323232323232222253330163370e9001180a8018991919191919299980e1999111919191919191919191919299981519b87480080044c94ccc0accdc3a400000226464646600200200444a66606400229444c8c94ccc0c4ccc0900080540504cc010010004528181b001181a0009bac3031001302900314a060520042a66605466e1d2004001132533302b3370e90000008991919198008008011129998190008a5013232533303133302400201501414a2266008008002606c00460680026eb0c0c4004c0a400c52818148010a99981519b87480180044c8c8c8c94ccc0b8cdc3a4000605a00426464a66606066e1d2000302f0051323233712002646660020020089000111299981c00108008999801801981d8011991299981b99981500100d80d099b80001480084004c0e8008004dd6981b00098170028019bac3034001302c00200114a0605a004605a00266ec00080104ccc074cdd2a40006605c0146605c0106605c00c6605c00897ae000e00d3028009302d001302d002302b001302b00230290013029002302700130270023025001301d001375860426044604460446044604460446044604460340066042604460446044604460446044604460340060142a66603866e1d2000301b00113232323232323232323253330263370e90000008991919299981499b8f002489064973737565640013232533302e30310021323232533302e3370e900018168008991919191919191919299981d181e80109919299981ca99981ca99981c99b8f00e00213370e01a00229404cdc3806a400429404c94ccc0e8cdc3a40040022646464a66607a66e1d2000303c001133302c3042303b00101601516333222323253330413370e900100089929998228008a6103d87a800013374a9000198231823800a5eb80c8cc004004018894ccc11800452f5c0264646464a66608e66e1d200200113300600600313304b304c3045002330060060033045001323253330473370e900200089919299982499b8f303b3766002016266e9520003304d0014bd700a60103d87a8000304d001304500214c103d87a80003045001304a304b304b3043002304a00230480011002303f001323300100100322533304400114c103d87a800013232323253330453371e00e004266e952000330490014bd7009980300300198230019bae3044002304800230460013304000d4bd7025eb7bdb180004dd71820000981c0030a99981d19b87480100044ccc0a4c0fcc0e001804c048528181c0028a50375a60740046eb8c0e000458c0ec004cc09400c060c0e4004c0e4008dd5981b800981b8009817000981a00098160008b19198008008069129998190008a6103d87a800013232533303132323253330343370e9001000899b8f375c6072606400403a2940c0c8004c0dc004c0bcc094c0bc0084cdd2a40006606a00497ae013300400400130360023034001375a605c0046eb8c0b000458c0bc004cc064c06801403058c068dd980b1bae302c001302401213232323300100100222533302d00114a226464a66605864646464a66606066606066e3c01004d2825114a2266e1c0052001375a6068002606800260660066eb8c0c40084cc01001000452818188011bac302f001323300100100222533302c00114bd70099199911191980080080191299981900088018991999111981b9ba73303737520126606e6ea400ccc0dcdd400125eb80004dd718188009bad30320013300300330360023034001375c60560026eacc0b0004cc00c00cc0c0008c0b8004c05c008c090044dd59814800981480098140011bac302600130260013025001301c005375c604400260340022c2c60400026040004603c002602c0066eb8c070004c05000c588894ccc050cdc3a4000602600626464646464646464a66603e6044004264a66603aa66603a66e3c0200284cdc39b8d00848100528099b8f00400b14a064a66603a66e1d2000001132323232323253330263029002132498c94ccc090cdc3a400000226464a66605260580042930b181500098110010a99981219b874800800454ccc09cc088008526161630220011630270013027002375a604a002604a004604600260360042c60360022c604000260400046eb8c078004c078008dd7180e000980e0011bae301a0013012003162233223253330153370e9001000880109bab301a30130033013002323300100100322533301700114c0103d87a800013232323253330183371e00e004266e9520003301c374c00297ae0133006006003375660320066eb8c05c008c06c008c0640052f5bded8c04646600200200444a66602a002297adef6c6013232323253330163371e910100002100313301a337606ea4008dd3000998030030019bab3017003375c602a0046032004602e00246e50004888c8c8c8c8c8c8c94ccc05ccdc3a40000022a66602e66e1d20003016004132323300100100b22533301d00114a026464a66603866e3c00801452889980200200098108011bae301f001375c6038602a0082c2a66602e66e1d2008001153330173370e9000180b0010991919299980d19b87480080044c8c94ccc070cdc3a4004603a6ea8c044c068c040c0680344cdc4002800899b89005001375a604000260300042940c060004c030c058c030c058024dd6980e180a8010b0a99980b99b874802800454ccc05ccdc3a4000602c0042646464a66603466e1d200200113232533301c3370e9001180e9baa3011301a3011301a00d13371000200a266e24004014dd69810000980c0010a503018001300c3016300d3016009375a6038602a0042c2940c054014c068004c068008c060004c060008c058004c03800c8c0480048c044c04800400c00401c018c03c004c03c008c034004c014010526136563253330073370e900000089919299980618078010a4c2c6eb8c034004c01400c54ccc01ccdc3a40040022a666014600a0062930b0b1802801118029baa001230033754002ae6955ceaab9e5573eae815d0aba24c17cd8799fd8799fd87a80d87a80d87a80d87a80d8799f9fd8799fd87980d8799f581c3dce7844f36b23b8c3f90afba40aa188e7f1d3f6e8acd1d544ed1da9ffd87a80d87a80ffffffffd87a9f581c2845076ede34cac7446e4e3637714b39a4dfcc5f91549213fd6aba6fff509565b074c5c930aff80cac59a2278b70ff0001f5f6",
    "utxos": [
        {
            "hash": "2e51b691eb1ce6c6d1b8bc8212e4ebe780a6fa4533f1dad41f276e5e39f16467",
            "index": 0,
            "address": "addr_test1vq7uu7zy7d4j8wxrly90hfq25xyw0uwn7m52e5w4gnk3m2gprf2za",
            "value": 9965427511,
            "assets": [
                {
                    "policy_id": "f0ff48bbb7bbe9d59a40f1ce90e9e9d0ff5002ec48f232b49ca0fb9a",
                    "asset_name": "cardanoproxies",
                    "quantity": 1
                },
                {
                    "policy_id": "f0ff48bbb7bbe9d59a40f1ce90e9e9d0ff5002ec48f232b49ca0fb9a",
                    "asset_name": "pepe",
                    "quantity": 1434
                },
                {
                    "policy_id": "f1ff48bbb7bbe9d59a40f1ce90e9e9d0ff5002ec48f232b49ca0fb9a",
                    "asset_name": "hello",
                    "quantity": 34
                }
            ]
        }
    ]
}'
```

- [x]  Build a transaction

```jsx
curl --location 'http://localhost:3000/6e2ab6cc28d943f48a84d92ad9b5392d/transactions/build' \
--header 'x-api-key: 8120536a5efc478b92809f8f1987a76e' \
--header 'Content-Type: application/json' \
--data '{
    "inputs": [
        {
            "address": "addr_test1qq2lamgej4xd6ycmhz3wmhpdu2me4f3x8klrmzcphcur7fm9388qnq9fyxt0c3qk0elu753ud03u598cnmsmdgh027nsjkxf5a",
            "hash": "08e4ead0e59b679fb7870c4416f2a9ba2bed8a2c8baa14f4f6d62c4222d2dfd7",
            "index": 0,
            "value": 631290454
        }
    ],
    "outputs": [
        {
            "address": "addr_test1qr69yj887txwu7ca7s9g5lr6sm7p8sf4dac295g7c44rfvma6t5aw0lpzxyk4r0r9tpdmremh0g37nal3q8fhjy97xwqpu4d5c",
            "value": 31290454
        }
    ],
    "signing_keys": ["xprv1..."],
    "change_address": "addr_test1qq2lamgej4xd6ycmhz3wmhpdu2me4f3x8klrmzcphcur7fm9388qnq9fyxt0c3qk0elu753ud03u598cnmsmdgh027nsjkxf5a"
}'
```

**Scripts**

- [x]  Retrieve a script

```jsx
curl --location 'http://localhost:3000/6e2ab6cc28d943f48a84d92ad9b5392d/scripts/bfc22757138e22b5159ef2fa833520bf6f204df5f77c2fa90e7a1ae8' \
--header 'x-api-key: 8120536a5efc478b92809f8f1987a76e'
```

- [x]  List script redeemers

```jsx
curl --location 'http://localhost:3000/6e2ab6cc28d943f48a84d92ad9b5392d/scripts/bfc22757138e22b5159ef2fa833520bf6f204df5f77c2fa90e7a1ae8/redeemers?size=20' \
--header 'x-api-key: 8120536a5efc478b92809f8f1987a76e'
```

- [x]  Retrieve datum

```jsx
curl --location 'http://localhost:3000/6e2ab6cc28d943f48a84d92ad9b5392d/datums/93892d0c469bd1228f0e94621d3101e755523e97ea0a837c9b509b1aeb9d8c42' \
--header 'x-api-key: 8120536a5efc478b92809f8f1987a76e'
```

**Wallet**

- [x]  Retrieve wallet summary

```jsx
curl --location 'http://localhost:3000/6e2ab6cc28d943f48a84d92ad9b5392d/wallets/stake_test1uzhh68e8rrgq8gkcp0qthvz3mh6exwnuq38dwkz4vts9zacs470yz' \
--header 'x-api-key: 8120536a5efc478b92809f8f1987a76e'
```

- [x]  List wallet addresses

```jsx
curl --location 'http://localhost:3000/6e2ab6cc28d943f48a84d92ad9b5392d/wallets/stake_test1uzhh68e8rrgq8gkcp0qthvz3mh6exwnuq38dwkz4vts9zacs470yz/addresses' \
--header 'x-api-key: 8120536a5efc478b92809f8f1987a76e'
```

- [x]  List stake addresses coin selection

```jsx
curl --location 'http://localhost:3000/6e2ab6cc28d943f48a84d92ad9b5392d/wallets/stake_test1uzhh68e8rrgq8gkcp0qthvz3mh6exwnuq38dwkz4vts9zacs470yz/coinselection' \
--header 'x-api-key: 8120536a5efc478b92809f8f1987a76e' \
--header 'Content-Type: application/json' \
--data '{
    "value": {
        "lovelace": 14000000
    }
}'
```

**Blocks**

- [x]  Retrieve latest block

```jsx
curl --location 'http://localhost:3000/6e2ab6cc28d943f48a84d92ad9b5392d/blocks/latest' \
--header 'x-api-key: 8120536a5efc478b92809f8f1987a76e'
```

- [x]  Retrieve block

```jsx
curl --location 'http://localhost:3000/6e2ab6cc28d943f48a84d92ad9b5392d/blocks/2240552' \
--header 'x-api-key: 8120536a5efc478b92809f8f1987a76e'

// by hash
curl --location 'http://localhost:3000/6e2ab6cc28d943f48a84d92ad9b5392d/blocks/21b8acd925a0c6a672d37919688f3b321acd91a71fffccd2545d4b47dc350365' \
--header 'x-api-key: 8120536a5efc478b92809f8f1987a76e'
```

- [x]  List block transactions

```jsx
curl --location 'http://localhost:3000/6e2ab6cc28d943f48a84d92ad9b5392d/blocks/2240550/transactions' \
--header 'x-api-key: 8120536a5efc478b92809f8f1987a76e'
```

**Assets**

- [x]  Retrieve asset

```jsx
curl --location 'http://localhost:3000/6e2ab6cc28d943f48a84d92ad9b5392d/assets/asset1d05sm64ha8urp0e04v9mu7tz3vhgln6lueka2x' \
--header 'x-api-key: 8120536a5efc478b92809f8f1987a76e'

// by policy + asset name
curl --location 'http://localhost:3000/6e2ab6cc28d943f48a84d92ad9b5392d/assets/2be8a928e26210a4d57e7c14e477703e83453cb85822273ab08ce98550524550524f445f4f5241434c45' \
--header 'x-api-key: 8120536a5efc478b92809f8f1987a76e'
```

- [x]  List asset addresses

```jsx
curl --location 'http://localhost:3000/6e2ab6cc28d943f48a84d92ad9b5392d/assets/asset1d05sm64ha8urp0e04v9mu7tz3vhgln6lueka2x/addresses' \
--header 'x-api-key: 8120536a5efc478b92809f8f1987a76e'
```

**Policy**

- [x]  List assets by policy

```jsx
curl --location 'http://localhost:3000/6e2ab6cc28d943f48a84d92ad9b5392d/policies/2be8a928e26210a4d57e7c14e477703e83453cb85822273ab08ce985/assets' \
--header 'x-api-key: 8120536a5efc478b92809f8f1987a76e'
```

**Epochs**

- [x]  Retrieve protocol parameters

```jsx
curl --location 'http://localhost:3000/6e2ab6cc28d943f48a84d92ad9b5392d/epochs/143/parameters' \
--header 'x-api-key: 8120536a5efc478b92809f8f1987a76e'
```

- [x]  Retrieve current epoch information

```jsx
curl --location 'http://localhost:3000/6e2ab6cc28d943f48a84d92ad9b5392d/epochs/current' \
--header 'x-api-key: 8120536a5efc478b92809f8f1987a76e'
```

**Pools**

- [x]  Retrieve stake pool metadata

```jsx
curl --location 'http://localhost:3000/6e2ab6cc28d943f48a84d92ad9b5392d/pools/pool1rkfs9glmfva3jd0q9vnlqvuhnrflpzj4l07u6sayfx5k7d788us' \
--header 'x-api-key: 8120536a5efc478b92809f8f1987a76e'
```

- [x]  List stake pool delegations


## Test

```bash
# unit tests
$ npm run test
```
