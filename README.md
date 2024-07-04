
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


# Cardano Webhooks

Access all the events that matter to your users, such as successful transactions, payments, and pool-minted blocks. Use our powerful webhooks to notify them instantly.

With webhooks, you can seamlessly integrate notifications. Stay informed about all the blockchain events important to your users, including successful transactions, payments, pool-minted blocks, and new delegations.

Features
- **Payments and transactions**: Allows sending notifications to users to know when their deposits, purchases, in-game actions or other on-chain activity has officially occurred.

- **Address Activity Webhooks**: Let your users know when transaction activity occurs on their address. No more refreshing the page or having to use the dust to identify a payment.

- **Monitoring and debug**: We log every triggered webhook so you can monitor their deliverability to different endpoints, disable failing ones and notify your customers.

- **Development experience**: Offer your users a great developer experience, including the ability to test and inspect their webhooks.

## What are Webhooks?
A webhook (also called a web callback or HTTP push API) is a way for an app to provide other applications with real-time information. A webhook delivers data to other applications as it happens, meaning you get data immediately. Unlike typical APIs where you would need to poll for data very frequently in order to get it real-time. This makes webhooks much more efficient for both provider and consumer. Webhooks work by registering a URL to send notifications once certain events occur.

You can think that Webhooks are like a phone number that Tangocrypto calls to notify you of activity in Cardano. The activity could be a payment to an address or reaching a particular epoch. The webhook endpoint is the person answering that call who takes actions based upon the specific information it receives.

A webhook endpoint is just more code on your server, which could be written in Node.js, Go, Java, Ruby, or whatever. The webhook endpoint has an associated URL (e.g. https://myserver.com/callback). The Tangocrypto notifications are Event objects. This Event object contains all the relevant information about what just happened, including the type of event and the data associated with that event. The webhook endpoint uses the event details to take any required actions, such as indicating that an NFT should be sent to a wallet. 

### Types of Webhooks
Tangocrypto offers 4 different types of webhooks:
- Payments
- Block
- Transaction
- Epoch
- Delegation
- Asset Activity

### Event standard structure
The Event structure always begins with the following parameters:
```
{
    "id": "2921e3df-c671-4d20-b51b-d176d5c1e43g", //** Unique uuid per event .**
    "api_version": "1.0", //**Represents the current Tangocrypto API version, which is v1.**
    "webhook_id": "d012a60eccb54c2ba97484f98137be56", // identifies the webhook
    "idempotency_key": "3b3359d0ccdb1d3d3ca8dbaa79cb5395b33c5bc52d782f3ea22904abef45d1j4", //**Specifies a unique ID used by Tangocrypto to recognize consecutive requests with the same data so that not to perform the same operation twice.**
    "object": "event",
    "create_date": 1633954086377,
    "type": "payment", // event type
    ...
}
```
`id`
Unique identifier per Event. 

`api_version`
The event scheme you receive depends on the version of the Tangocrypto API. Currently, we use v1. When you set a subscription for an event while using v1 of the API, the callback will be returned according to v1 specifics.

Each time we update our API to the next version you will have to reset your Event subscriptions so that they correspond to the newest version currently in use. To do that you'll need to remove the event subscription and set it up again. Otherwise, the callback response will be received in the format of the older API version it was set up in.

`webhook_id`
The webhook_id indicates a reference to the webhook and It's is a unique code. Each time you set up an event subscription, the corresponding Event always has a parameter webhook_id.

`idempotency_key`
Idempotency represents a process in computing and REST that a server uses to recognize subsequent retries of the same request where the returned result always remains the same. It is a security mechanism for retrying requests without the risk of performing the same operation more than once.

Such risks usually can occur when an API call is for some reason disrupted during processing (e.g. network connection error) and a response is not returned. In such cases, the API call would be retried. By including an idempotency_id in the initial request there is a guarantee that the specific action won’t be done more than once.

The idempotency_id is generated only by Tangocrypto webhooks. It is added to the Event and is unique per triggered webhook. 

### 1. Payment
The Payment Webhook allows you to track payments to an address. This provides your app with real-time state changes when an address sends or receives tokens. 

Payload example:
```
{
    "id": "3c23ff25-481c-4e3e-859b-f515135a49b0",
    "data": {
        "transaction": {
            "id": "3776000",
            "fee": "168317",
            "hash": "e29b4f5e2650560ac61dfa3ccf311e020782d8ccdf295dbbf1cfe2e65583d417",
            "size": 289,
            "block": {
                "id": "3372157",
                "fees": "2104143",
                "hash": "7fac4956202395c06028b442faba4f3fda68490e2eb7373bd9d0b7b212ff9e1f",
                "pool": {
                    "url": "https://my-ip.at/atada.testnet-metadata-2.json",
                    "hash": "b4fba3c5a430634f2e5e7007b33be02562efbcd036c0cf3dbb9d9dbdf418ef27",
                    "name": "ATADA TestnetPool Austria",
                    "ticker": "ATADA",
                    "pool_id": "pool18yslg3q320jex6gsmetukxvzm7a20qd90wsll9anlkrfua38flr",
                    "homepage": "https://stakepool.at",
                    "description": "Testnet-Environment Pool ..."
                },
                "size": 6561,
                "time": "Thu Feb 24 2022 12:52:38 GMT+0000 (Coordinated Universal Time)",
                "op_cert": "f9096c23c3a3d8afd8d05467fed2bc75405cdbc27ba2106b55a585e414d26573",
                "out_sum": "9793211682245",
                "slot_no": 51337942,
                "vrf_key": "vrf_vk1sleujze3zraykllkafvrxggcmpts3hp6zxrpazdkdzp9g07kkehsnmy8ka",
                "block_no": 3345852,
                "epoch_no": 189,
                "tx_count": "11",
                "next_block": null,
                "slot_leader": "pool18yslg3q320jex6gsmetukxvzm7a20qd90wsll9anlkrfua38flr",
                "confirmations": 1,
                "epoch_slot_no": 59542,
                "previous_block": 3345851
            },
            "deposit": "0",
            "out_sum": "948312856",
            "block_id": "3372157",
            "block_index": 2,
            "script_size": 0,
            "invalid_before": null,
            "valid_contract": true,
            "invalid_hereafter": "51359405"
        },
        "from": [{
            "address": "addr_test1qqvelqlqk94qm9syd40mpqkvdvk0z8ka8mt7e2sfcrq07rmazcna98r9s350vpnyghfsuqk2y29yq88tdcvwm8j0p5dqsg32es",
            "hash": "d6ef469d198fbf62a5b9860ba9295b9c9fddb80078e975ba032653f66b070b51",
            "index": 1,
            "value": "948481173",
            "smart_contract": false,
            "assets": []
        }],
        "to": [{
                "address": "addr_test1qz5xdujk7unjmyrvqazy7l4w9dzxxfgt48ppv9tsjwywrzckyjqzaxt9rkqxc62m7tcdfylykzzjktqzlwssxfl3mlyqafvh99",
                "hash": "e29b4f5e2650560ac61dfa3ccf311e020782d8ccdf295dbbf1cfe2e65583d417",
                "index": 0,
                "value": "2564320",
                "smart_contract": false,
                "assets": []
            },
            {
                "address": "addr_test1qqvelqlqk94qm9syd40mpqkvdvk0z8ka8mt7e2sfcrq07rmazcna98r9s350vpnyghfsuqk2y29yq88tdcvwm8j0p5dqsg32es",
                "hash": "e29b4f5e2650560ac61dfa3ccf311e020782d8ccdf295dbbf1cfe2e65583d417",
                "index": 1,
                "value": "945748536",
                "smart_contract": false,
                "assets": []
            }
        ]
    },
    "type": "payment",
    "object": "event",
    "webhook_id": "532ce2beb2aa42738e1cc9c5f708168c",
    "api_version": "1.0",
    "create_date": 1645707159923,
    "idempotency_key": "755a42b339274829aefd153285084132532ce2beb2aa42738e1cc9c5f708168c",
    "network": "testnet"
}
```

### 2. Block
This event is triggered every time a new block is created. 

Payload example:
```
{
  "id": "7b7c0d8a-8885-46d6-8e05-0d0802d95473",
  "data": {
    "id": "6864165",
    "fees": "17182282",
    "hash": "641aa7bcd185e036d6a379d4908639d436a540158d1db6debd0e2c3b2fa7c8cd",
    "pool": {
      "url": "https://ccwallet.io/ccw.metadata.210713.json",
      "hash": "924ec324a9d2d172cd3fe44fbbb526e5c6bea677fb7276f07387c847dfe9026d",
      "name": "TITANstaking #2",
      "ticker": "TITAN",
      "pool_id": "pool19pyfv4xnln8x4l7auw0n0skk3hd97shun707hrw5d4s553ys74x",
      "homepage": "https://www.titanstaking.io",
      "description": "For a TITAN strong Cardano network. Based in Germany. 💪 Join us! Telegram: https://t.me/titanstakingio - Twitter: https://twitter.com/titanstaking"
    },
    "size": 58970,
    "time": "Fri Feb 04 2022 11:45:09 GMT+0000 (Coordinated Universal Time)",
    "op_cert": "400345da097b2eb0194b4a76f87b6853b07e8b96b5de30b671b0e83c54530cd3",
    "out_sum": "10738455237",
    "slot_no": 52408818,
    "vrf_key": "vrf_vk19kgvazgrvr9gstsk2qn0vz0hc9x8yn3lqdymzgztm92qk6r4q9asksen0h",
    "block_no": 6840368,
    "epoch_no": 318,
    "tx_count": "37",
    "next_block": null,
    "slot_leader": "pool19pyfv4xnln8x4l7auw0n0skk3hd97shun707hrw5d4s553ys74x",
    "confirmations": 1,
    "epoch_slot_no": 396018,
    "previous_block": 6840367
  },
  "type": "block",
  "object": "event",
  "webhook_id": "98c7051ff06b4651949466655ef974fe",
  "api_version": "1.0",
  "create_date": 1643975112334,
  "idempotency_key": "53a957187a4a4dd888b6839ea2d4452298c7051ff06b4651949466655ef974fe",
  "network": "mainnet"
}
```

### 3. Transaction
This event is triggered every time a new transaction is added to the blockchain. 

Payload example
```
{
  "id": "123c4446-7a4f-4e8b-8baf-3c1437101859",
  "data": {
    "id": "3344667",
    "fee": "305781",
    "hash": "057585b42409a71c34d664e945acb92f30f09f966c5d18f098881c2dbf909d6f",
    "size": 2825,
    "block": {
      "id": "3275904",
      "fees": "1582516",
      "hash": "00fd351c00be3f1775361de12576d51ee582157e330d1ebe596498295a46d02e",
      "pool": {
        "url": null,
        "hash": null,
        "raw_id": "7679567d0559ed3df7cb54a848b9568b04d1976b9926d54ae9efdd3f",
        "pool_id": "pool1weu4vlg9t8knma7t2j5y3w2k3vzdr9mtnynd2jhfalwn76nwh48"
      },
      "size": 6980,
      "time": "Wed Jan 19 2022 23:11:35 GMT+0000 (Coordinated Universal Time)",
      "op_cert": "60ffa1e3c1ab6d03a5447d2f40ab023dbce45b13f0e372d63a964d31c7ee6079",
      "out_sum": "18474206426",
      "slot_no": 48264679,
      "vrf_key": "vrf_vk1mzhz5k03lahvx0gdlqtplkyasgzn8w2cpf8y8a8f76nzskptzzhqdqyyq3",
      "block_no": 3251329,
      "epoch_no": 182,
      "tx_count": "8",
      "next_block": null,
      "slot_leader": "pool1weu4vlg9t8knma7t2j5y3w2k3vzdr9mtnynd2jhfalwn76nwh48",
      "confirmations": 1,
      "epoch_slot_no": 10279,
      "previous_block": 3251328
    },
    "deposit": "0",
    "out_sum": "1591350310",
    "block_id": "3275904",
    "block_index": 1,
    "script_size": 2014,
    "invalid_before": "48264456",
    "valid_contract": true,
    "invalid_hereafter": "48278855"
  },
  "type": "transaction",
  "object": "event",
  "webhook_id": "5ef8985b5ee74b4388f324293df17173",
  "api_version": "1.0",
  "create_date": 1642633895460,
  "idempotency_key": "5wIH/+H/cOj3K+gv3zOek89bEbIXDgxz5ef8985b5ee74b4388f324293df17173"
}
```
### 4. Epoch
Get notified when an epoch starts.

Payload example:
```
{
    "no": 178,
    "start_time": "2022-01-04T20:20:24.000Z"
}
```

### 5. Delegation
This allows you to track delegations in the specified pool by its ticker or pool ID. 

Payload Example:
```
{
  "id": "d0cf3218-761f-4ca1-900b-7750fb66fb59",
  "data": {
    "id": 97463,
    "pool": {
      "url": "https://apex.nextvm.net/test/testpoolMetadata.json",
      "hash": "f5ac677b58443ed2c9c9d53aa56652e71a132679e67ed9068f0227867172faf4",
      "name": "ApexTestPool",
      "raw_id": "5f5ed4eb2ba354ab2ad7c8859f3dacf93564637a105e80c8d8a7dc3c",
      "ticker": "APEXT",
      "pool_id": "pool1ta0df6et5d22k2khezze70dvly6kgcm6zp0gpjxc5lwrce0seyq",
      "homepage": "https://cardano-apexpool.github.io/test/",
      "description": "Apex Cardano Test Pool"
    },
    "tx_id": 3340342,
    "addr_id": 402710,
    "slot_no": 48240615,
    "redeemer_id": null,
    "pool_hash_id": 1030,
    "active_epoch_no": 183
  },
  "type": "delegation",
  "object": "event",
  "webhook_id": "7c827ccd2d524eb5aadf1e5a391077aa",
  "api_version": "1.0",
  "create_date": 1642609833343,
  "idempotency_key": "p90C0LTvk1XX1Ha8+JDPzzFfybhxJYYt7c827ccd2d524eb5aadf1e5a391077aa"
}
```
### 6. Asset Activity
The Asset Activity Webhook allows you to track all the tokens with labels 721 (NFT) and 20 (FT). This provides your app with real-time changes when a new asset is minted on the blockchain, or is transferred between addresses.

Event object: 
- `assets`: Array of asset objects in the transaction. 
- `quantity`: Amount of assets minted or burned in the transaction. The quantity is 0 when the assets are part of the transaction (trasfered or not) but, but wasn't minted or burned.
- `ft_minted`: The value istrue if a fungible token (FT) was minted in the transaction. In this case the transaction contains the creation of a token with the label 20 in the metadata. In Cardano FT are native tokens and part of the ledger.
- `policy_id`: policy id of asset in the transaction. Cardano NFTs need to be identified by the policy id. This id is unique and attached permanently to the asset.
- `asset_name`: asset name.
- `nft_minted`: The value is true if a Non Fungible Token (NFT) was minted in the transaction. In this case the transaction contains the creation of a token with the label 721 in the metadata. In Cardano NFTs are native tokens and part of the ledger. For more information have a look at CIP25. 
- `fingerprint`: The CIP14 fingerprint for the multi-asset.
- `metadata`: Asset metadata.
- `transaction`: Transaction information.

Payload example:
```
{
  "id": "5a5810bc-388d-4ec3-adb3-578a3c2d2744",
  "data": {
    "assets": [
      {
        "quantity": 1,
        "ft_minted": false,
        "policy_id": "23b38042ebbe12754d51b29216474a159fe045183e6a31763fd2014b",
        "asset_name": "token3",
        "nft_minted": true,
        "fingerprint": "asset1y3xu2rd0d7xk3d4phh5zy5gwxjuzcfccmwe79k"
      }
    ],
    "metadata": [
      {
        "json": {
          "23b38042ebbe12754d51b29216474a159fe045183e6a31763fd2014b": {
            "token3": {
              "name": "token3",
              "color": "black",
              "image": "ipfs://QmVVQfgggha37KoCmRquDTdKzL1h5TKibAkKt7bsG1zykV",
              "mouth": "open",
              "left_eye": "round shaped",
              "mediaType": "image/png",
              "right_eye": "close set",
              "collection": "Bulky",
              "description": "description 3"
            }
          }
        },
        "label": "721"
      }
    ],
    "transaction": {
      "id": "5264771",
      "fee": "192913",
      "hash": "a9aea41c9c779f5c0b1bfb88bb38421b2df378e816def0e4347e059abd2ee98f",
      "size": 852,
      "block": {
        "id": "3790285",
        "fees": "192913",
        "hash": "44cb871bcca6ae919af790456d57322c333afbc70542afe9508b5b03b8c5d4c4",
        "pool": {
          "url": "https://ada4profit.com/testnet/JUNO.metadata.json",
          "hash": "cb29a10b0b85a7befdadcdac55deba5651143bc5bc1b9016e4e9958905767cbc",
          "name": "JUNO",
          "ticker": "JUNO",
          "pool_id": "pool15sfcpy4tps5073gmra0e6tm2dgtrn004yr437qmeh44sgjlg2ex",
          "homepage": "https://junostakepool.com",
          "description": "JUNO STAKE POOL ON TESTNET"
        },
        "size": 856,
        "time": "Wed Aug 10 2022 02:57:20 GMT+0000 (Coordinated Universal Time)",
        "op_cert": "ac3628ad64dbc80aaad05881edf521c899e9aa92c7754ad7334c263a196c7d42",
        "out_sum": "9807087",
        "slot_no": "65731024",
        "vrf_key": "vrf_vk1deaac8se2ct0gvnmwck3zy8heantl2shwq7mvxzdvnl3vzq65kvqjgell6",
        "block_no": 3769590,
        "epoch_no": 222,
        "tx_count": "1",
        "next_block": null,
        "slot_leader": "pool15sfcpy4tps5073gmra0e6tm2dgtrn004yr437qmeh44sgjlg2ex",
        "confirmations": 1,
        "epoch_slot_no": 196624,
        "previous_block": 3769589
      },
      "deposit": "0",
      "out_sum": "9807087",
      "block_id": "3790285",
      "block_index": 0,
      "script_size": 0,
      "invalid_before": "0",
      "valid_contract": true,
      "invalid_hereafter": "100000000"
    }
  },
  "type": "asset",
  "object": "event",
  "webhook_id": "09068350e65946bfbedf5c2443c2a236",
  "api_version": "1.0",
  "create_date": 1660100241865,
  "idempotency_key": "405c2c9981754a8d9eb1dadcbdc7d85809068350e65946bfbedf5c2443c2a236",
  "network": "testnet"
}
```

# How to create webhooks
## Fine-Grained Control for the Information You Want to Receive from the Blockchain

You can create rules or trigger conditions for every webhook. You can set up these rules through the Tangocrypto Dashboard or the API. Each rule is composed of a field, a value, and an operator. All conditions must be met for the webhook to be triggered. Rules are optional; depending on the number and parameters of the rules, the webhook may or may not be triggered.

### Example Request

```http
POST https://cardano-testnet.tangocrypto.com/{app_id}/v1/nft/collections/{collection_id}/tokens
```
### Body Parameters

- **Type**: Webhook type, it can be `payment` | `block` | `transaction` | `epoch` | `delegation` | `asset` | `nft_api`
- **name**: Webhook name
- **network**: `mainnet` | `testnet`
- **description**: Webhook description
- **callback_url**: The URL where your server is listening. We send a POST request to this URL with the webhook event.
- **address**: Destination address. This field is used only in the payment webhook and is mandatory for payment webhooks.
- **rules**: Every rule is composed of a field, a value, and an operator. All conditions must be met for the webhook to be triggered. Rules are optional; depending on the number and parameters of the rules, the webhook may or may not be triggered.
  - **field**: Depends on the type of webhook; it can be `policy_id`, `asset_name`, `fingerprint`, `amount`, etc.
  - **operator**: A comparison operator used to compare the value against the field.
  - **value**: The value depends on the type of webhook.

 ## Payment Webhook
Allowed values for field, value, and operator:

### Field Descriptions

- **policy_id**: The policy id identifies Cardano assets. This id is unique and attached permanently to the asset, and several assets can have the same policy id.
  - **Operator**: `=`
  
- **asset_name**: Asset name in UTF-8.
  - **Operator**: `=`
  
- **fingerprint**: Asset fingerprint (CIP14).
  - **Operator**: `=`
  
- **value**: Amount of Ada in the payment.
  - **Operators**: `=`, `>`, `<`, `>=`, `<=`
  
- **quantity**: Quantity of a certain native asset.
  - **Operators**: `=`, `>`, `<`, `>=`, `<=`
  
### Rules Examples

```json
[
  {"field": "policy_id", "value": "a0028f350aaabe0545fdcb56b039bfb08e4bb4d8c4d7c3c7d481c235", "operator": "="}, 
  {"field": "asset_name", "value": "Husky", "operator": "="},
  {"field": "fingerprint", "value": "asset123213123123xxxxx", "operator": "="},
  {"field": "value", "value": "1", "operator": "="},
  {"field": "quantity", "value": "1", "operator": "="}
]
```

### Request examples
Trigger the webhook when the address receives a payment (any amount of Ada):
```
curl --location --request POST 'https://cardano-testnet.tangocrypto.com/<app-id>/v1/webhooks' \
--header 'content-type: application/json' \
--header 'x-api-key: <x-api-key>' \
--data-raw '{
    "type": "payment",
    "name": "Payment webhook",
    "network": "testnet",
    "description": "Notify payments on the specified address",
    "callback_url": "https://webhook.site/74e4201b-d651-4971-8b74-ebd6b10fd967",
    "address": "addr_test1qqqv50804vhe30n25awp6f8mhy9z3rrysva2mj4c9geaqyjr5gtdwq4yajng57kje93tt3fkc5k8cvvem7vl8yql2mcsxcstnx"
}'
```
Trigger the webhook when the address receives more than 5 Ada:
```
curl --location --request POST 'https://cardano-testnet.tangocrypto.com/<app-id>/v1/webhooks' \
--header 'content-type: application/json' \
--header 'x-api-key: <x-api-key>' \
--data-raw '{
    "type": "payment",
    "name": "Payment webhook",
    "network": "testnet",
    "description": "Notify on payment with more than 5 Ada",
    "callback_url": "https://webhook.site/74e4201b-d651-4971-8b74-ebd6b10fd967",
    "address": "addr_test1qqqv50804vhe30n25awp6f8mhy9z3rrysva2mj4c9geaqyjr5gtdwq4yajng57kje93tt3fkc5k8cvvem7vl8yql2mcsxcstnx",
    "rules": [
        {
            "field": "amount",
            "operator": ">",
            "value": "5"
        }
    ]
}'
```

Trigger the webhook when the address receives more than 5 RBERRY tokens:
```
curl --location --request POST 'https://cardano-testnet.tangocrypto.com/<app-id>/v1/webhooks' \
--header 'content-type: application/json' \
--header 'x-api-key: <x-api-key>' \
--data-raw '{
    "type": "payment",
    "name": "Payment webhook",
    "network": "testnet",
    "description": "Notify on payment with more than 5 RBERRY",
    "callback_url": "https://webhook.site/74e4201b-d651-4971-8b74-ebd6b10fd967",
    "address": "addr_test1qqqv50804vhe30n25awp6f8mhy9z3rrysva2mj4c9geaqyjr5gtdwq4yajng57kje93tt3fkc5k8cvvem7vl8yql2mcsxcstnx",
    "rules": [
        {
            "field": "asset_name",
            "operator": "=",
            "value": "RBERRY"
        },
        {
            "field": "quantity",
            "operator": ">",
            "value": "5"
        }
    ]
}'
```
Trigger the webhook when the address receives more than 5 tokens with the specified policy_id :
```
curl --location --request POST 'https://cardano-testnet.tangocrypto.com/<app-id>/v1/webhooks' \
--header 'content-type: application/json' \
--header 'x-api-key: <x-api-key>' \
--data-raw '{
    "type": "payment",
    "name": "Payment webhook",
    "network": "testnet",
    "description": "Notify on payment with more than 5 CHOCK, MINT, RBERRY, SBERRY and VANIL",
    "callback_url": "https://webhook.site/74e4201b-d651-4971-8b74-ebd6b10fd967",
    "address": "addr_test1qqqv50804vhe30n25awp6f8mhy9z3rrysva2mj4c9geaqyjr5gtdwq4yajng57kje93tt3fkc5k8cvvem7vl8yql2mcsxcstnx",
    "rules": [
        {
            "field": "policy_id",
            "operator": "=",
            "value": "57fca08abbaddee36da742a839f7d83a7e1d2419f1507fcbf3916522"
        },
        {
            "field": "quantity",
            "operator": ">",
            "value": "5"
        }
    ]
}'
```

## Block Webhook
Allowed values for field and value:

### Field Descriptions

- **tx_count**: Amount of transactions in a block.
  - **Operators**: `=`, `>`, `<`, `>=`, `<=`
  
- **out_sum**: Block total output sum in Lovelace.
  - **Operators**: `=`, `>`, `<`, `>=`, `<=`
  
- **fees**: Block total fees in Lovelace.
  - **Operators**: `=`, `>`, `<`, `>=`, `<=`
  
- **block_no**: Block number.
  - **Operators**: `=`, `>`, `<`, `>=`, `<=`
  
- **pool.ticker**: Pool ticker.
  - **Operator**: `=`
  
- **pool.pool_id**: Pool ID.
  - **Operator**: `=`
  
- **size**: Transaction size.
  - **Operators**: `=`, `>`, `<`, `>=`, `<=`

### Rules Examples

```json
[
  {"field": "tx_count", "value": 10, "operator": ">"},
  {"field": "out_sum", "value": 100000, "operator": ">"}, 
  {"field": "pool.ticker", "value": "TANGO", "operator": "="},
  {"field": "pool.pool_id", "value": "pool1weu4vlg9t8knma7t2j5y3w2k3vzdr9mtnynd2jhfalwn76nwh48", "operator": "="},
  {"field": "fees", "value": 5000000, "operator": "<"},
  {"field": "block_no", "value": 24345, "operator": ">"},
  {"field": "size", "value": 36864, "operator": ">"}
]
```

### Request Examples
Blocks with 3 or more transactions
```
curl --location --request POST 'https://cardano-testnet.tangocrypto.com/<app-id>/v1/webhooks' \
--header 'content-type: application/json' \
--header 'x-api-key: <x-api-key>' \
--data-raw '{
    "type": "block",
    "name": "Block webhook",
    "network": "testnet",
    "description": "Notify on blocks with 3 or more transactions",
    "callback_url": "https://webhook.site/74e4201b-d651-4971-8b74-ebd6b10fd967",
    "rules": [
        {
            "field": "tx_count",
            "operator": ">=",
            "value": "3"
        }
    ]
}'
```

## Transaction
Allowed values for field and value:

### Field Descriptions

- **out_sum**: Transaction total output sum in Lovelace.
  - **Operators**: `=`, `>`, `<`, `>=`, `<=`
  
- **fee**: Transaction total fees in Lovelace (1 Ada is 1,000,000 Lovelace).
  - **Operators**: `=`, `>`, `<`, `>=`, `<=`
  
- **smart_contract_count**: Smart contracts count in the transaction.
  - **Operators**: `=`, `>`, `<`, `>=`, `<=`

### Rules Examples

```json
[
    {"field": "out_sum", "value": 100000000, "operator": ">"}, 
    {"field": "fee", "value": 5000000, "operator": "<"}
]
```

### Request Examples
Transactions with more than 10 Million Ada (Whale alert):
```
curl --location --request POST 'https://cardano-testnet.tangocrypto.com/<app-id>/v1/webhooks' \
--header 'content-type: application/json' \
--header 'x-api-key: <x-api-key>' \
--data-raw '{
    "type": "transaction",
    "name": "Transaction webhook",
    "network": "testnet",
    "description": "Transactions with more than 10M Ada ",
    "callback_url": "https://webhook.site/74e4201b-d651-4971-8b74-ebd6b10fd967",
    "rules": [
        {
            "field": "out_sum",
            "operator": ">=",
            "value": "10000000000000"
        }
    ]
}'
```
## Epoch
Allowed values for field and value:

### Field Descriptions

- **no**: Epoch number.
  - **Operators**: `=`, `>`, `<`, `>=`, `<=`

### Rules Examples

```json
[
    {"field": "epoch_no", "value": 380, "operator": "="}
]
```
To get notified at the beginning of every epoch don't use rules.  
```
curl --location --request POST 'https://cardano-testnet.tangocrypto.com/<app-id>/v1/webhooks' \
--header 'content-type: application/json' \
--header 'x-api-key: <x-api-key>' \
--data-raw '{
    "type": "epoch",
    "name": "Epoch webhook",
    "network": "testnet",
    "description": "Notify on every epoch",
    "callback_url": "https://webhook.site/2bb93279-a979-4233-9a08-3b330c417f1e",
}'
```
## Delegation
Allowed values for field and value:

### Field Descriptions

- **pool.pool_id**: Pool ID.
  - **Operator**: `=`
  
- **pool.ticker**: Pool ticker.
  - **Operator**: `=`

### Rules Examples

```json
[
    {"field": "pool.pool_id", "value": "pool133h6zcgqalxr6f0lvz6h2lajsyhmzjw4eae62n098tx6g47ypgk", "operator": "="}
]
```
Example
```
curl --location --request POST 'https://cardano-testnet.tangocrypto.com/<app-id>/v1/webhooks' \
--header 'content-type: application/json' \
--header 'x-api-key: <x-api-key>' \
--data-raw '{
   "type": "delegation",
    "name": "Delegation webhook",
    "network": "testnet",
    "description": "Notify when TANGO pool receives a new delegation",
    "callback_url": "https://webhook.site/74e4201b-d651-4971-8b74-ebd6b10fd967",
    "rules": [
        {
            "field": "pool.pool_id",
            "operator": "=",
            "value": "pool133h6zcgqalxr6f0lvz6h2lajsyhizjw4eae62n098tx6g47ypgk"
        } 
    ]
}'
```
## Asset Activity
The Asset Activity webhook allows you to track all the tokens with the labels 721 (NFT) and 20 (FT). This provides your app with real-time state changes when an asset is minted/burned on the blockchain or is transferred between addresses.

### Allowed values for field and value:

#### Field Descriptions

- **nft_minted**: Boolean indicating if an NFT is minted.
  - **Operators**: `=`, `!=`
  
- **ft_minted**: Boolean indicating if an FT is minted.
  - **Operators**: `=`, `!=`
  
- **policy_id**: The policy id identifies Cardano assets. This id is unique and attached permanently to the asset, and several assets can have the same policy id.
  - **Operator**: `=`
  
- **asset_name**: Asset name in UTF-8.
  - **Operator**: `=`
  
- **fingerprint**: Asset fingerprint (CIP14).
  - **Operator**: `=`
  
- **quantity**: Quantity of a certain native asset.
  - **Operators**: `=`, `>`, `<`, `>=`, `<=`

### Examples

```json
[
    {"field": "nft_minted", "value": true, "operator": "="}, 
    {"field": "ft_minted", "value": true, "operator": "="},
    {"field": "policy_id", "value": "23b38042ebbe12754d51b29216474a159fe045183e6a31763fd2014b", "operator": "="},
    {"field": "asset_name", "value": "Husky", "operator": "="},
    {"field": "fingerprint", "value": "asset1ysac0ajdvfaldejkw5nt77yj0uwtq8aman3l2n", "operator": "="},
    {"field": "quantity", "value": 1, "operator": "="}
]
```
### Request Examples
Receive notifications when an asset with a certain policy id is minted:
```
curl --location --request POST 'https://cardano-testnet/<app-id>/v1/webhooks' \
--header 'content-type: application/json' \
--header 'x-api-key: <x-api-key>' \
--data-raw '{
    "type": "asset",
    "name": "webhook nft",
    "network": "testnet",
    "description": "testing nft webhooks",
    "callback_url": "https://webhook.site/0ee2d926-6e76-4658-8f3b-e2a427ef3d1d",
    "rules": [
        {
            "field": "nft_minted",
            "operator": "=",
            "value": true
        },
        {
            "field": "policy_id",
            "operator": "=",
            "value": "23b38042ebbe12754d51b29216474a159fe045183e6a31763fd2014b"
        }
    ]
}'
```
Receive notifications when any NFT is minted:
```
curl --location --request POST 'https://cardano-testnet/<app-id>/v1/webhooks' \
--header 'content-type: application/json' \
--header 'x-api-key: <x-api-key>' \
--data-raw '{
    "type": "asset",
    "name": "webhook nft",
    "network": "testnet",
    "description": "testing nft webhooks",
    "callback_url": "https://webhook.site/0ee2d926-6e76-4658-8f3b-e2a427ef3d1d",
    "rules": [
        {
            "field": "nft_minted",
            "operator": "=",
            "value": true
        }
    ]
}'
```
All the transactions with assets
```
curl --location --request POST 'https://cardano-testnet/<app-id>/v1/webhooks' \
--header 'content-type: application/json' \
--header 'x-api-key: <x-api-key>' \
--data-raw '{
    "type": "asset",
    "name": "webhook nft",
    "network": "testnet",
    "description": "testing nft webhooks",
    "callback_url": "https://webhook.site/0ee2d926-6e76-4658-8f3b-e2a427ef3d1d"
}'
```

