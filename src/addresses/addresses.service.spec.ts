import { Test, TestingModule } from '@nestjs/testing';
import { AddressesService } from './addresses.service';
import { ConfigService } from '@nestjs/config';
import { UtxoProfile } from '../mappers/utxo.mapper';
import { ValueProfile } from '../mappers/value.mapper';
import { TangoLedgerService } from '../providers/tango-ledger/tango-ledger.service';
import { AddressesController } from './addresses.controller';
import { AutomapperModule, getMapperToken } from '@automapper/nestjs';
import { createMapper } from '@automapper/core';
import { pojos } from '@automapper/pojos';
import { mocked } from 'jest-mock';
import { Utils } from '../common/utils';
import { AssetProfile } from '../mappers/asset.mapper';
import { Asset, Utxo } from '@tangocrypto/tango-ledger';

const sortAsset = (a: Asset, b: Asset) => `${a.policy_id}${a.asset_name}`.localeCompare(`${b.policy_id}${b.asset_name}`);
const sortUtxo = (a: Utxo, b: Utxo) => `${a.hash}#${a.index}`.localeCompare(`${b.hash}#${b.index}`);

describe('AddressesService', () => {
  let service: AddressesService;

  const config = {
    "DB_HOST": "host.docker.internal",
    "DB_PORT": 5432,
    "DB_NAME": "testnet_preprod",
    "DB_USER": "leo",
    "DB_DEBUG": false,
    "AWS_REGION": "us-east-1",
    "NETWORK": "testnet",
    "DYNAMO_DB_ACCOUNT_TABLE_NAME": "accounts-stage",
    "REDIS_HOST": "redis",
    "REDIS_PORT": 6379,
    "BUSINESS_ADDRESS": "addr_test1qpc6srdq6jjt6eetstw6t4elmypvepa6ykxcps3dvvv4fr5ca6s0m36w9nlk7ntwdhvhxeyz9u4lngn97fcv4ykjqc2sk4hrgy",
    "BUSINESS_POLICY_ID": "581180fd4d301e925c123e3f1fe78cee670369bf4cca4a9ff3e564d7",
    "BUSINESS_POLICY_SCRIPT": "{\"type\":\"all\",\"scripts\":[{\"type\":\"sig\",\"keyHash\":\"8e1cabc60001e3dba8cbba922d804282f161caa93019dcf38d785d36\"},{\"type\":\"sig\",\"keyHash\":\"10e327f6e5aaf7647dbd0bac71c166238573e7046459d2158798d1cb\"}]}",
    "BUSINESS_POLICY_SCRIPT_KEYS": "[\"xprv1azat96jpx7jfu2k2kdtagmtjt9fttypn29mktm3zd9tj6q5754fn9vpgkk8av23a3zeaszszmwfkq2lzj6s866dveuhd5vf8wa4lr4ukyyqmtuhysde3hagyrkvqhmdyu9e7eaznevwyttlxtd0e84j0tg65q8kw\",\"xprv1lzxurvslxtdpkutc3crupg9casz36pmptxm3k8n6ays2lcr6dd9g472vnymkdf9at7l9frw870c8z9a3cj7u4a2942wfnk889kxde8mef037q3eg7qtptgjfwe72w7kmt6mpzrhgkrpxtsydrzmrzsf3qckqrpqq\"]",
    "BUSINESS_TOKEN_NAME": "TEST_TANGO",
    "SUBMIT_EVENTBUS_NAME": "cardano-submit-stage",
  }

  const configService = {
    provide: ConfigService,
    useValue: {
      get: jest.fn((key: string) => config[key])
    }
  }

  beforeEach(async () => {
    // mockedUtils.mockClear();
    const module: TestingModule = await Test.createTestingModule({
      imports: [AutomapperModule],
      controllers: [AddressesController],
      providers: [
        {
          provide: getMapperToken('pojo-mapper'),
          useValue: createMapper(
            { name: 'pojo-mapper', pluginInitializer: pojos }
          ),
        },
        AddressesService,
        TangoLedgerService,
        configService,
        UtxoProfile,
        ValueProfile,
        AssetProfile
      ],
    }).compile();

    service = module.get<AddressesService>(AddressesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should coin selection only ADA', async () => {
    // arrange
    const address = 'addr_test1qpfepft9zs3y8ejcv84tq6tkp00wdm46fr6h3am02leunk8dc55q34v2ggxw9hea4rr3rry933a2zdh60v43h237s8ks7t2dja';
    const utxos = [{
      "address": "addr_test1qpfepft9zs3y8ejcv84tq6tkp00wdm46fr6h3am02leunk8dc55q34v2ggxw9hea4rr3rry933a2zdh60v43h237s8ks7t2dja",
      "hash": "25cd47bf49807f28c06835af9dd8984c15d48203dd1e875e5c26d95849876011",
      "index": 1,
      "value": 1000000,
      "has_script": false,
      "assets": []
    }];

    const data = {
      "selection": [{
        "address": "addr_test1qpfepft9zs3y8ejcv84tq6tkp00wdm46fr6h3am02leunk8dc55q34v2ggxw9hea4rr3rry933a2zdh60v43h237s8ks7t2dja",
        "hash": "25cd47bf49807f28c06835af9dd8984c15d48203dd1e875e5c26d95849876011",
        "index": 1,
        "value": 1000000,
        "has_script": false,
        "assets": []
      }]
    };

    const payload: any = {
      "value": {
        "lovelace": 1000000
      }
    };

    Utils.getAllUtxos = jest.fn().mockReturnValue(utxos);

    // act
    const response = await service.coinSelection(address, payload);

    // assert
    expect(response).toEqual(data)
  })

  it('should coin selection only ADA with change', async () => {
    // arrange
    const address = 'addr_test1qpfepft9zs3y8ejcv84tq6tkp00wdm46fr6h3am02leunk8dc55q34v2ggxw9hea4rr3rry933a2zdh60v43h237s8ks7t2dja';
    const utxos = [{
      "address": "addr_test1qpfepft9zs3y8ejcv84tq6tkp00wdm46fr6h3am02leunk8dc55q34v2ggxw9hea4rr3rry933a2zdh60v43h237s8ks7t2dja",
      "hash": "25cd47bf49807f28c06835af9dd8984c15d48203dd1e875e5c26d95849876011",
      "index": 0,
      "value": 3000000,
      "has_script": false,
      "assets": []
    },
    {
      "address": "addr_test1qpfepft9zs3y8ejcv84tq6tkp00wdm46fr6h3am02leunk8dc55q34v2ggxw9hea4rr3rry933a2zdh60v43h237s8ks7t2dja",
      "hash": "25cd47bf49807f28c06835af9dd8984c15d48203dd1e875e5c26d95849876011",
      "index": 1,
      "value": 1000000,
      "has_script": false,
      "assets": []
    }];

    const data = {
      "selection": [{
        "address": "addr_test1qpfepft9zs3y8ejcv84tq6tkp00wdm46fr6h3am02leunk8dc55q34v2ggxw9hea4rr3rry933a2zdh60v43h237s8ks7t2dja",
        "hash": "25cd47bf49807f28c06835af9dd8984c15d48203dd1e875e5c26d95849876011",
        "index": 0,
        "value": 3000000,
        "has_script": false,
        "assets": []
      },
      {
        "address": "addr_test1qpfepft9zs3y8ejcv84tq6tkp00wdm46fr6h3am02leunk8dc55q34v2ggxw9hea4rr3rry933a2zdh60v43h237s8ks7t2dja",
        "hash": "25cd47bf49807f28c06835af9dd8984c15d48203dd1e875e5c26d95849876011",
        "index": 1,
        "value": 1000000,
        "has_script": false,
        "assets": []
      }],
      "change": {
        "lovelace": 1300000,
        "assets": []
      }
    };

    const payload: any = {
      "value": {
        "lovelace": 2700000
      }
    };

    Utils.getAllUtxos = jest.fn().mockReturnValue(utxos);

    // act
    const response = await service.coinSelection(address, payload);

    // assert
    expect(response).toEqual(data)
  })

  it('should coin selection only ADA discard change (too small)', async () => {
    // arrange
    const address = 'addr_test1qpfepft9zs3y8ejcv84tq6tkp00wdm46fr6h3am02leunk8dc55q34v2ggxw9hea4rr3rry933a2zdh60v43h237s8ks7t2dja';
    const utxos = [{
      "address": "addr_test1qpfepft9zs3y8ejcv84tq6tkp00wdm46fr6h3am02leunk8dc55q34v2ggxw9hea4rr3rry933a2zdh60v43h237s8ks7t2dja",
      "hash": "25cd47bf49807f28c06835af9dd8984c15d48203dd1e875e5c26d95849876011",
      "index": 0,
      "value": 3000000,
      "has_script": false,
      "assets": []
    },
    {
      "address": "addr_test1qpfepft9zs3y8ejcv84tq6tkp00wdm46fr6h3am02leunk8dc55q34v2ggxw9hea4rr3rry933a2zdh60v43h237s8ks7t2dja",
      "hash": "25cd47bf49807f28c06835af9dd8984c15d48203dd1e875e5c26d95849876011",
      "index": 1,
      "value": 1000000,
      "has_script": false,
      "assets": []
    }];

    const data = {
      "selection": [{
        "address": "addr_test1qpfepft9zs3y8ejcv84tq6tkp00wdm46fr6h3am02leunk8dc55q34v2ggxw9hea4rr3rry933a2zdh60v43h237s8ks7t2dja",
        "hash": "25cd47bf49807f28c06835af9dd8984c15d48203dd1e875e5c26d95849876011",
        "index": 0,
        "value": 3000000,
        "has_script": false,
        "assets": []
      },
      {
        "address": "addr_test1qpfepft9zs3y8ejcv84tq6tkp00wdm46fr6h3am02leunk8dc55q34v2ggxw9hea4rr3rry933a2zdh60v43h237s8ks7t2dja",
        "hash": "25cd47bf49807f28c06835af9dd8984c15d48203dd1e875e5c26d95849876011",
        "index": 1,
        "value": 1000000,
        "has_script": false,
        "assets": []
      }]
    };

    const payload: any = {
      "value": {
        "lovelace": 3300000
      }
    };

    Utils.getAllUtxos = jest.fn().mockReturnValue(utxos);

    // act
    const response = await service.coinSelection(address, payload);

    // assert
    expect(response).toEqual(data)
  })

  it('should coin selection ADA with Assets change (extra)', async () => {
    // arrange
    const address = 'addr_test1qpfepft9zs3y8ejcv84tq6tkp00wdm46fr6h3am02leunk8dc55q34v2ggxw9hea4rr3rry933a2zdh60v43h237s8ks7t2dja';
    const utxos = [{
      "address": "addr_test1qpfepft9zs3y8ejcv84tq6tkp00wdm46fr6h3am02leunk8dc55q34v2ggxw9hea4rr3rry933a2zdh60v43h237s8ks7t2dja",
      "hash": "25cd47bf49807f28c06835af9dd8984c15d48203dd1e875e5c26d95849876011",
      "index": 0,
      "value": 3000000,
      "has_script": false,
      "assets": [{
        "policy_id": "777e6b4903dab74963ae581d39875c5dac16c09bb1f511c0af1ddda8",
        "asset_name": "6141414441",
        "quantity": 1
      }]
    },
    {
      "address": "addr_test1qpfepft9zs3y8ejcv84tq6tkp00wdm46fr6h3am02leunk8dc55q34v2ggxw9hea4rr3rry933a2zdh60v43h237s8ks7t2dja",
      "hash": "25cd47bf49807f28c06835af9dd8984c15d48203dd1e875e5c26d95849876011",
      "index": 1,
      "value": 1500000,
      "has_script": false,
      "assets": [{
        "policy_id": "777e6b4903dab74963ae581d39875c5dac16c09bb1f511c0af1ddda8",
        "asset_name": "f141414f41",
        "quantity": 1
      }]
    },
    {
      "address": "addr_test1qpfepft9zs3y8ejcv84tq6tkp00wdm46fr6h3am02leunk8dc55q34v2ggxw9hea4rr3rry933a2zdh60v43h237s8ks7t2dja",
      "hash": "25cd47bf49807f28c06835af9dd8984c15d48203dd1e875e5c26d95849876011",
      "index": 2,
      "value": 1500000,
      "has_script": false,
      "assets": [{
        "policy_id": "777e6b4903dab74963ae581d39875c5dac16c09bb1f511c0af1ddda9",
        "asset_name": "0141414442",
        "quantity": 15
      }]
    }
    ];

    const data = {
      "selection": [
        {
          "address": "addr_test1qpfepft9zs3y8ejcv84tq6tkp00wdm46fr6h3am02leunk8dc55q34v2ggxw9hea4rr3rry933a2zdh60v43h237s8ks7t2dja",
          "hash": "25cd47bf49807f28c06835af9dd8984c15d48203dd1e875e5c26d95849876011",
          "index": 0,
          "value": 3000000,
          "has_script": false,
          "assets": [{
            "policy_id": "777e6b4903dab74963ae581d39875c5dac16c09bb1f511c0af1ddda8",
            "asset_name": "6141414441",
            "quantity": 1
          }]
        },
        {
          "address": "addr_test1qpfepft9zs3y8ejcv84tq6tkp00wdm46fr6h3am02leunk8dc55q34v2ggxw9hea4rr3rry933a2zdh60v43h237s8ks7t2dja",
          "hash": "25cd47bf49807f28c06835af9dd8984c15d48203dd1e875e5c26d95849876011",
          "index": 1,
          "value": 1500000,
          "has_script": false,
          "assets": [{
            "policy_id": "777e6b4903dab74963ae581d39875c5dac16c09bb1f511c0af1ddda8",
            "asset_name": "f141414f41",
            "quantity": 1
          }]
        },
        {
          "address": "addr_test1qpfepft9zs3y8ejcv84tq6tkp00wdm46fr6h3am02leunk8dc55q34v2ggxw9hea4rr3rry933a2zdh60v43h237s8ks7t2dja",
          "hash": "25cd47bf49807f28c06835af9dd8984c15d48203dd1e875e5c26d95849876011",
          "index": 2,
          "value": 1500000,
          "has_script": false,
          "assets": [{
            "policy_id": "777e6b4903dab74963ae581d39875c5dac16c09bb1f511c0af1ddda9",
            "asset_name": "0141414442",
            "quantity": 15
          }]
        }
      ],
      "change": {
        "lovelace": 2500000,
        "assets": [{
          "policy_id": "777e6b4903dab74963ae581d39875c5dac16c09bb1f511c0af1ddda8",
          "asset_name": "6141414441",
          "quantity": 1
        },
        {
          "policy_id": "777e6b4903dab74963ae581d39875c5dac16c09bb1f511c0af1ddda8",
          "asset_name": "f141414f41",
          "quantity": 1
        },
        {
          "policy_id": "777e6b4903dab74963ae581d39875c5dac16c09bb1f511c0af1ddda9",
          "asset_name": "0141414442",
          "quantity": 15
        }
        ]
      }
    };

    const payload: any = {
      "value": {
        "lovelace": 3500000
      }
    };

    Utils.getAllUtxos = jest.fn().mockReturnValue(utxos);

    // act
    const response = await service.coinSelection(address, payload);

    // assert
    expect(response.selection.sort(sortUtxo)).toEqual(data.selection.sort(sortUtxo));
    expect(response.change.lovelace).toEqual(data.change.lovelace);
    expect(response.change.assets.sort(sortAsset)).toEqual(data.change.assets.sort(sortAsset));
  })

  it('should coin selection only Asset with change (ADA for compliance)', async () => {
    // arrange
    const address = 'addr_test1qpfepft9zs3y8ejcv84tq6tkp00wdm46fr6h3am02leunk8dc55q34v2ggxw9hea4rr3rry933a2zdh60v43h237s8ks7t2dja';
    const utxos = [{
      "address": "addr_test1qpfepft9zs3y8ejcv84tq6tkp00wdm46fr6h3am02leunk8dc55q34v2ggxw9hea4rr3rry933a2zdh60v43h237s8ks7t2dja",
      "hash": "25cd47bf49807f28c06835af9dd8984c15d48203dd1e875e5c26d95849876011",
      "index": 1,
      "value": 1728310,
      "has_script": false,
      "assets": [{
        "policy_id": "777e6b4903dab74963ae581d39875c5dac16c09bb1f511c0af1ddda8",
        "asset_name": "6141414441",
        "quantity": 1
      }]
    }];

    const data = {
      "selection": [{
        "address": "addr_test1qpfepft9zs3y8ejcv84tq6tkp00wdm46fr6h3am02leunk8dc55q34v2ggxw9hea4rr3rry933a2zdh60v43h237s8ks7t2dja",
        "hash": "25cd47bf49807f28c06835af9dd8984c15d48203dd1e875e5c26d95849876011",
        "index": 1,
        "value": 1728310,
        "has_script": false,
        "assets": [{
          "policy_id": "777e6b4903dab74963ae581d39875c5dac16c09bb1f511c0af1ddda8",
          "asset_name": "6141414441",
          "quantity": 1
        }]
      }]
    };

    const payload: any = {
      "value": {
        "assets": [{
          "policy_id": "777e6b4903dab74963ae581d39875c5dac16c09bb1f511c0af1ddda8",
          "asset_name": "6141414441",
          "quantity": 1
        }]
      }
    };

    Utils.getAllUtxos = jest.fn().mockReturnValue(utxos);

    // act
    const response = await service.coinSelection(address, payload);

    // assert
    expect(response).toEqual(data);
  })

  it('should coin selection ADA with assets change partial Asset', async () => {
    // arrange
    const address = 'addr_test1qpfepft9zs3y8ejcv84tq6tkp00wdm46fr6h3am02leunk8dc55q34v2ggxw9hea4rr3rry933a2zdh60v43h237s8ks7t2dja';

    const utxos = [
      {
        "address": "addr_test1qpfepft9zs3y8ejcv84tq6tkp00wdm46fr6h3am02leunk8dc55q34v2ggxw9hea4rr3rry933a2zdh60v43h237s8ks7t2dja",
        "hash": "766f679525973d2ea43fd1d7946198e649db0754c9246f5f0a68982124c3f6c6",
        "index": 1,
        "value": 1728310,
        "has_script": false,
        "assets": [
          {
            "policy_id": "0607f27e6a018a3401fec40e1c352c9cfc8d853ddeb335b6389fb4d1",
            "asset_name": "000de140426c6f623130",
            "asset_name_label": 222,
            "fingerprint": "asset1jwt2x0rv0ldwus7438r9tlgkjsat8ry2t97vdu",
            "quantity": 1
          },
          {
            "policy_id": "15b0f22e306237b693d652f1be9f985ae4afbe66558f683574cb345f",
            "asset_name": "000de140426c6f623133",
            "asset_name_label": 222,
            "fingerprint": "asset1hw8vhkh9wjleyv2p3gms0g77dy8ad34xqvynu9",
            "quantity": 1
          },
          {
            "policy_id": "15b0f22e306237b693d652f1be9f985ae4afbe66558f683574cb345f",
            "asset_name": "000de140426c6f623134",
            "asset_name_label": 222,
            "fingerprint": "asset17c3vy74vux03w282whqp23n305wsycdmfyee85",
            "quantity": 1
          },
          {
            "policy_id": "1bacfe5a185e8f66135270363935bcffce4e0ec369a42d7e5b3737e0",
            "asset_name": "4e465431",
            "fingerprint": "asset1zcparzy7mdwtld4fqtxal0zrkzk7lwd8h3gee2",
            "quantity": 1
          },
          {
            "policy_id": "777e6b4903dab74963ae581d39875c5dac16c09bb1f511c0af1ddda8",
            "asset_name": "6141414441",
            "fingerprint": "asset14p3nne3edut62hxkpjkt07hukzuwmpdta5p42c",
            "quantity": 29
          }
        ]
      },
      {
        "address": "addr_test1qpfepft9zs3y8ejcv84tq6tkp00wdm46fr6h3am02leunk8dc55q34v2ggxw9hea4rr3rry933a2zdh60v43h237s8ks7t2dja",
        "hash": "62ac01af45a445c071b25379a1bc9483ed3d7d637dc5ae522bfb4a3a139e1ba9",
        "index": 1,
        "value": 3000000,
        "has_script": false,
        "assets": []
      },
      {
        "address": "addr_test1qpfepft9zs3y8ejcv84tq6tkp00wdm46fr6h3am02leunk8dc55q34v2ggxw9hea4rr3rry933a2zdh60v43h237s8ks7t2dja",
        "hash": "2beacda3b5094ac6cc1f462ea229e6d837a04ca1b35e18d0f0f2d251780e54e4",
        "index": 1,
        "value": 1159390,
        "has_script": false,
        "assets": [
          {
            "policy_id": "c6e65ba7878b2f8ea0ad39287d3e2fd256dc5c4160fc19bdf4c4d87e",
            "asset_name": "7447454e53",
            "fingerprint": "asset1mvqjrt76g9yxsle3z92ums7snlpg02p274gek4",
            "quantity": 1000000
          }
        ]
      },
      {
        "address": "addr_test1qpfepft9zs3y8ejcv84tq6tkp00wdm46fr6h3am02leunk8dc55q34v2ggxw9hea4rr3rry933a2zdh60v43h237s8ks7t2dja",
        "hash": "8555d8828d07c5f7c0b9a4a451516e5389e88b063d165a12356c041f34407f09",
        "index": 1,
        "value": 33000000,
        "has_script": false,
        "assets": []
      },
      {
        "address": "addr_test1qpfepft9zs3y8ejcv84tq6tkp00wdm46fr6h3am02leunk8dc55q34v2ggxw9hea4rr3rry933a2zdh60v43h237s8ks7t2dja",
        "hash": "4146f93cc9a16636146507cd62129d16c63f7a484eb50ff1d48c1387663a9192",
        "index": 1,
        "value": 2000000,
        "has_script": false,
        "assets": []
      },
      {
        "address": "addr_test1qpfepft9zs3y8ejcv84tq6tkp00wdm46fr6h3am02leunk8dc55q34v2ggxw9hea4rr3rry933a2zdh60v43h237s8ks7t2dja",
        "hash": "cd7815ebc08f711dc250d09036e186c50fddbbf28e1e4c2408b100088bf6b95c",
        "index": 0,
        "value": 2000000,
        "has_script": false,
        "assets": []
      },
      {
        "address": "addr_test1qpfepft9zs3y8ejcv84tq6tkp00wdm46fr6h3am02leunk8dc55q34v2ggxw9hea4rr3rry933a2zdh60v43h237s8ks7t2dja",
        "hash": "6eeb77476177f982552a13264a3225659ac599b8c6f283d79abd4932618e4b03",
        "index": 1,
        "value": 4000000,
        "has_script": false,
        "assets": [
          {
            "policy_id": "c6e65ba7878b2f8ea0ad39287d3e2fd256dc5c4160fc19bdf4c4d87e",
            "asset_name": "7447454e53",
            "fingerprint": "asset1mvqjrt76g9yxsle3z92ums7snlpg02p274gek4",
            "quantity": 1000000
          }
        ]
      },
      {
        "address": "addr_test1qpfepft9zs3y8ejcv84tq6tkp00wdm46fr6h3am02leunk8dc55q34v2ggxw9hea4rr3rry933a2zdh60v43h237s8ks7t2dja",
        "hash": "25cd47bf49807f28c06835af9dd8984c15d48203dd1e875e5c26d95849876011",
        "index": 1,
        "value": 4000000,
        "has_script": false,
        "assets": []
      },
      {
        "address": "addr_test1qpfepft9zs3y8ejcv84tq6tkp00wdm46fr6h3am02leunk8dc55q34v2ggxw9hea4rr3rry933a2zdh60v43h237s8ks7t2dja",
        "hash": "b265a900d97bf43143d95dab3f071bc66ed3dee47efc696b69bc3228030bb0de",
        "index": 1,
        "value": 3000000,
        "has_script": false,
        "assets": []
      },
      {
        "address": "addr_test1qpfepft9zs3y8ejcv84tq6tkp00wdm46fr6h3am02leunk8dc55q34v2ggxw9hea4rr3rry933a2zdh60v43h237s8ks7t2dja",
        "hash": "0f08a6029f0b1f52d5db473d930757d76b95b3b5a0347220d963346991de333e",
        "index": 1,
        "value": 3000000,
        "has_script": false,
        "assets": []
      },
      {
        "address": "addr_test1qpfepft9zs3y8ejcv84tq6tkp00wdm46fr6h3am02leunk8dc55q34v2ggxw9hea4rr3rry933a2zdh60v43h237s8ks7t2dja",
        "hash": "f1c6e5f3c53f37acb4a64759cd14a3852d06521091e6d35b8fd41e87bc1ab511",
        "index": 0,
        "value": 3500000,
        "has_script": false,
        "assets": [
          {
            "policy_id": "c6e65ba7878b2f8ea0ad39287d3e2fd256dc5c4160fc19bdf4c4d87e",
            "asset_name": "7447454e53",
            "fingerprint": "asset1mvqjrt76g9yxsle3z92ums7snlpg02p274gek4",
            "quantity": 1000000
          }
        ]
      },
      {
        "address": "addr_test1qpfepft9zs3y8ejcv84tq6tkp00wdm46fr6h3am02leunk8dc55q34v2ggxw9hea4rr3rry933a2zdh60v43h237s8ks7t2dja",
        "hash": "876cd3f4947f4f06ba8934a12032308c1497608616c1c2ae4c7027629b84a70a",
        "index": 1,
        "value": 5000000,
        "has_script": false,
        "assets": []
      },
      {
        "address": "addr_test1qpfepft9zs3y8ejcv84tq6tkp00wdm46fr6h3am02leunk8dc55q34v2ggxw9hea4rr3rry933a2zdh60v43h237s8ks7t2dja",
        "hash": "c60195d093927d647b370ff3ebdf74ba160dda638484b8c7bcb379cfb48a4cb8",
        "index": 1,
        "value": 5000000,
        "has_script": false,
        "assets": []
      },
      {
        "address": "addr_test1qpfepft9zs3y8ejcv84tq6tkp00wdm46fr6h3am02leunk8dc55q34v2ggxw9hea4rr3rry933a2zdh60v43h237s8ks7t2dja",
        "hash": "5a9fcba23827b0394d32f3ded8348d5115fd308a65ebec787e30cd4ccf852313",
        "index": 1,
        "value": 44000000,
        "has_script": false,
        "assets": []
      },
      {
        "address": "addr_test1qpfepft9zs3y8ejcv84tq6tkp00wdm46fr6h3am02leunk8dc55q34v2ggxw9hea4rr3rry933a2zdh60v43h237s8ks7t2dja",
        "hash": "647fd3302aec3570d08c190c23905351d480ab598139e6f1c3a1f35ef86d76d8",
        "index": 1,
        "value": 44000000,
        "has_script": false,
        "assets": []
      },
      {
        "address": "addr_test1qpfepft9zs3y8ejcv84tq6tkp00wdm46fr6h3am02leunk8dc55q34v2ggxw9hea4rr3rry933a2zdh60v43h237s8ks7t2dja",
        "hash": "f0d680596c2f794a2f82a4e672a06415a4a808195eb61aa7b54fcc9e42a92119",
        "index": 2,
        "value": 27759435,
        "has_script": false,
        "assets": []
      },
      {
        "address": "addr_test1qpfepft9zs3y8ejcv84tq6tkp00wdm46fr6h3am02leunk8dc55q34v2ggxw9hea4rr3rry933a2zdh60v43h237s8ks7t2dja",
        "hash": "bec27dc6902fba57406b376b67d9b502cae1242d0b8d480cc7cd62d116114fc7",
        "index": 3,
        "value": 10000000,
        "has_script": false,
        "assets": []
      },
      {
        "address": "addr_test1qpfepft9zs3y8ejcv84tq6tkp00wdm46fr6h3am02leunk8dc55q34v2ggxw9hea4rr3rry933a2zdh60v43h237s8ks7t2dja",
        "hash": "a89220b35ff05314396505896190fcf6cf7ce5cd00e1f8d55d6c9f9586b04797",
        "index": 4,
        "value": 3000000,
        "has_script": false,
        "assets": []
      }
    ]

    const data = {
      "selection": [
        {
          "address": "addr_test1qpfepft9zs3y8ejcv84tq6tkp00wdm46fr6h3am02leunk8dc55q34v2ggxw9hea4rr3rry933a2zdh60v43h237s8ks7t2dja",
          "hash": "647fd3302aec3570d08c190c23905351d480ab598139e6f1c3a1f35ef86d76d8",
          "index": 1,
          "value": 44000000,
          "has_script": false,
          "assets": []
        },
        {
          "address": "addr_test1qpfepft9zs3y8ejcv84tq6tkp00wdm46fr6h3am02leunk8dc55q34v2ggxw9hea4rr3rry933a2zdh60v43h237s8ks7t2dja",
          "hash": "766f679525973d2ea43fd1d7946198e649db0754c9246f5f0a68982124c3f6c6",
          "index": 1,
          "value": 1728310,
          "has_script": false,
          "assets": [
            {
              "policy_id": "0607f27e6a018a3401fec40e1c352c9cfc8d853ddeb335b6389fb4d1",
              "asset_name": "000de140426c6f623130",
              "asset_name_label": 222,
              "fingerprint": "asset1jwt2x0rv0ldwus7438r9tlgkjsat8ry2t97vdu",
              "quantity": 1
            },
            {
              "policy_id": "15b0f22e306237b693d652f1be9f985ae4afbe66558f683574cb345f",
              "asset_name": "000de140426c6f623133",
              "asset_name_label": 222,
              "fingerprint": "asset1hw8vhkh9wjleyv2p3gms0g77dy8ad34xqvynu9",
              "quantity": 1
            },
            {
              "policy_id": "15b0f22e306237b693d652f1be9f985ae4afbe66558f683574cb345f",
              "asset_name": "000de140426c6f623134",
              "asset_name_label": 222,
              "fingerprint": "asset17c3vy74vux03w282whqp23n305wsycdmfyee85",
              "quantity": 1
            },
            {
              "policy_id": "1bacfe5a185e8f66135270363935bcffce4e0ec369a42d7e5b3737e0",
              "asset_name": "4e465431",
              "fingerprint": "asset1zcparzy7mdwtld4fqtxal0zrkzk7lwd8h3gee2",
              "quantity": 1
            },
            {
              "policy_id": "777e6b4903dab74963ae581d39875c5dac16c09bb1f511c0af1ddda8",
              "asset_name": "6141414441",
              "fingerprint": "asset14p3nne3edut62hxkpjkt07hukzuwmpdta5p42c",
              "quantity": 29
            }
          ]
        }
      ],
      "change": {
        "lovelace": 31728310,
        "assets": [
          {
            "quantity": 1,
            "policy_id": "15b0f22e306237b693d652f1be9f985ae4afbe66558f683574cb345f",
            "asset_name_label": 222,
            "asset_name": "000de140426c6f623133",
            "fingerprint": "asset1hw8vhkh9wjleyv2p3gms0g77dy8ad34xqvynu9"
          },
          {
            "quantity": 1,
            "policy_id": "15b0f22e306237b693d652f1be9f985ae4afbe66558f683574cb345f",
            "asset_name_label": 222,
            "asset_name": "000de140426c6f623134",
            "fingerprint": "asset17c3vy74vux03w282whqp23n305wsycdmfyee85"
          },
          {
            "quantity": 1,
            "policy_id": "1bacfe5a185e8f66135270363935bcffce4e0ec369a42d7e5b3737e0",
            "asset_name": "4e465431",
            "fingerprint": "asset1zcparzy7mdwtld4fqtxal0zrkzk7lwd8h3gee2"
          },
          {
            "quantity": 23,
            "policy_id": "777e6b4903dab74963ae581d39875c5dac16c09bb1f511c0af1ddda8",
            "asset_name": "6141414441",
            "fingerprint": "asset14p3nne3edut62hxkpjkt07hukzuwmpdta5p42c"
          }
        ]
      }
    }

    const payload = {
      "value": {
        "lovelace": 14000000,
        "assets": [
          {
            "policy_id": "0607f27e6a018a3401fec40e1c352c9cfc8d853ddeb335b6389fb4d1",
            "asset_name": "000de140426c6f623130",
            "quantity": 1
          },
          {
            "policy_id": "777e6b4903dab74963ae581d39875c5dac16c09bb1f511c0af1ddda8",
            "asset_name": "6141414441",
            "quantity": 6
          }
        ]
      }
    }

    Utils.getAllUtxos = jest.fn().mockReturnValue(utxos);

    // act
    const response = await service.coinSelection(address, payload);

    // assert
    expect(response.selection.sort(sortUtxo)).toEqual(data.selection.sort(sortUtxo));
    expect(response.change.assets.sort(sortAsset)).toEqual(data.change.assets.sort(sortAsset));
  })

  it('should coin selection throw Insufficient UTxO balance', async () => {
    // arrange
    const address = 'addr_test1qpfepft9zs3y8ejcv84tq6tkp00wdm46fr6h3am02leunk8dc55q34v2ggxw9hea4rr3rry933a2zdh60v43h237s8ks7t2dja';
    const utxos = [
      {
        "address": "addr_test1qpfepft9zs3y8ejcv84tq6tkp00wdm46fr6h3am02leunk8dc55q34v2ggxw9hea4rr3rry933a2zdh60v43h237s8ks7t2dja",
        "hash": "25cd47bf49807f28c06835af9dd8984c15d48203dd1e875e5c26d95849876011",
        "index": 0,
        "value": 1000000,
        "has_script": false,
        "assets": []
      },
      {
        "address": "addr_test1qpfepft9zs3y8ejcv84tq6tkp00wdm46fr6h3am02leunk8dc55q34v2ggxw9hea4rr3rry933a2zdh60v43h237s8ks7t2dja",
        "hash": "25cd47bf49807f28c06835af9dd8984c15d48203dd1e875e5c26d95849876011",
        "index": 1,
        "value": 5000000,
        "has_script": false,
        "assets": []
      },
      {
        "address": "addr_test1qpfepft9zs3y8ejcv84tq6tkp00wdm46fr6h3am02leunk8dc55q34v2ggxw9hea4rr3rry933a2zdh60v43h237s8ks7t2dja",
        "hash": "25cd47bf49807f28c06835af9dd8984c15d48203dd1e875e5c26d95849876011",
        "index": 1,
        "value": 3000000,
        "has_script": false,
        "assets": []
      }
    ];


    const error = 'Insufficient UTxO balance';

    const payload: any = {
      "value": {
        "lovelace": 10000000
      }
    };

    Utils.getAllUtxos = jest.fn().mockReturnValue(utxos);

    // act
    const response = service.coinSelection(address, payload);

    // assert
    await expect(response).rejects.toThrow(error);
  })

  it('should coin selection throw Insufficient UTxO balance (change other assets)', async () => {
    // arrange
    const address = 'addr_test1qpfepft9zs3y8ejcv84tq6tkp00wdm46fr6h3am02leunk8dc55q34v2ggxw9hea4rr3rry933a2zdh60v43h237s8ks7t2dja';
    const utxos = [
      {
        "address": "addr_test1qpfepft9zs3y8ejcv84tq6tkp00wdm46fr6h3am02leunk8dc55q34v2ggxw9hea4rr3rry933a2zdh60v43h237s8ks7t2dja",
        "hash": "25cd47bf49807f28c06835af9dd8984c15d48203dd1e875e5c26d95849876011",
        "index": 0,
        "value": 1500000,
        "has_script": false,
        "assets": [
          {
            "policy_id": "0607f27e6a018a3401fec40e1c352c9cfc8d853ddeb335b6389fb4d1",
            "asset_name": "426c6f623130",
            "fingerprint": "asset1jwt2x0rv0ldwus7438r9tlgkjsat8ry2t97vdu",
            "quantity": 1
          },
          {
            "policy_id": "15b0f22e306237b693d652f1be9f985ae4afbe66558f683574cb345f",
            "asset_name": "426c6f623133",
            "fingerprint": "asset1hw8vhkh9wjleyv2p3gms0g77dy8ad34xqvynu9",
            "quantity": 1
          },
        ]
      }
    ];

    const error = 'Insufficient UTxO balance';

    const payload: any = {
      "value": {
        "assets": [
          {
            "policy_id": "0607f27e6a018a3401fec40e1c352c9cfc8d853ddeb335b6389fb4d1",
            "asset_name": "426c6f623130",
            "asset_name_label": 222,
            "fingerprint": "asset1jwt2x0rv0ldwus7438r9tlgkjsat8ry2t97vdu",
            "quantity": 1
          }
        ]
      }
    };

    Utils.getAllUtxos = jest.fn().mockReturnValue(utxos);

    // act
    const response = service.coinSelection(address, payload);

    // assert
    await expect(response).rejects.toThrow(error);
  })

  it('should coin selection throw Insufficient UTxO balance (change same assets)', async () => {
    // arrange
    const address = 'addr_test1qpfepft9zs3y8ejcv84tq6tkp00wdm46fr6h3am02leunk8dc55q34v2ggxw9hea4rr3rry933a2zdh60v43h237s8ks7t2dja';
    const utxos = [
      {
        "address": "addr_test1qpfepft9zs3y8ejcv84tq6tkp00wdm46fr6h3am02leunk8dc55q34v2ggxw9hea4rr3rry933a2zdh60v43h237s8ks7t2dja",
        "hash": "25cd47bf49807f28c06835af9dd8984c15d48203dd1e875e5c26d95849876011",
        "index": 0,
        "value": 1500000,
        "has_script": false,
        "assets": [
          {
            "policy_id": "0607f27e6a018a3401fec40e1c352c9cfc8d853ddeb335b6389fb4d1",
            "asset_name": "426c6f623130",
            "fingerprint": "asset1jwt2x0rv0ldwus7438r9tlgkjsat8ry2t97vdu",
            "quantity": 10
          }
        ]
      }
    ];

    const error = 'Insufficient UTxO balance';

    const payload: any = {
      "value": {
        "assets": [
          {
            "policy_id": "0607f27e6a018a3401fec40e1c352c9cfc8d853ddeb335b6389fb4d1",
            "asset_name": "426c6f623130",
            "fingerprint": "asset1jwt2x0rv0ldwus7438r9tlgkjsat8ry2t97vdu",
            "quantity": 7
          }
        ]
      }
    };

    Utils.getAllUtxos = jest.fn().mockReturnValue(utxos);

    // act
    const response = service.coinSelection(address, payload);

    // assert
    await expect(response).rejects.toThrow(error);
  })

  it('should coin selection throw Invalid ADA amount', async () => {
    // arrange
    const address = 'addr_test1qpfepft9zs3y8ejcv84tq6tkp00wdm46fr6h3am02leunk8dc55q34v2ggxw9hea4rr3rry933a2zdh60v43h237s8ks7t2dja';
    const utxos = [
      {
        "address": "addr_test1qpfepft9zs3y8ejcv84tq6tkp00wdm46fr6h3am02leunk8dc55q34v2ggxw9hea4rr3rry933a2zdh60v43h237s8ks7t2dja",
        "hash": "25cd47bf49807f28c06835af9dd8984c15d48203dd1e875e5c26d95849876011",
        "index": 0,
        "value": 1000000,
        "has_script": false,
        "assets": []
      },
      {
        "address": "addr_test1qpfepft9zs3y8ejcv84tq6tkp00wdm46fr6h3am02leunk8dc55q34v2ggxw9hea4rr3rry933a2zdh60v43h237s8ks7t2dja",
        "hash": "25cd47bf49807f28c06835af9dd8984c15d48203dd1e875e5c26d95849876011",
        "index": 1,
        "value": 5000000,
        "has_script": false,
        "assets": []
      },
      {
        "address": "addr_test1qpfepft9zs3y8ejcv84tq6tkp00wdm46fr6h3am02leunk8dc55q34v2ggxw9hea4rr3rry933a2zdh60v43h237s8ks7t2dja",
        "hash": "25cd47bf49807f28c06835af9dd8984c15d48203dd1e875e5c26d95849876011",
        "index": 1,
        "value": 3000000,
        "has_script": false,
        "assets": []
      }
    ];


    const error = /Invalid ADA amount 700000, it should be >= \d+/;

    const payload: any = {
      "value": {
        "lovelace": 700000
      }
    };

    Utils.getAllUtxos = jest.fn().mockReturnValue(utxos);

    // act
    const response = service.coinSelection(address, payload);

    // assert
    await expect(response).rejects.toThrow(error);
  })

  it('should coin selection throw Maximum transaction inputs exceeded', async () => {
    // arrange
    const address = 'addr_test1qpfepft9zs3y8ejcv84tq6tkp00wdm46fr6h3am02leunk8dc55q34v2ggxw9hea4rr3rry933a2zdh60v43h237s8ks7t2dja';
    const utxos = [
      {
        "address": "addr_test1qpfepft9zs3y8ejcv84tq6tkp00wdm46fr6h3am02leunk8dc55q34v2ggxw9hea4rr3rry933a2zdh60v43h237s8ks7t2dja",
        "hash": "25cd47bf49807f28c06835af9dd8984c15d48203dd1e875e5c26d95849876011",
        "index": 0,
        "value": 1000000,
        "has_script": false,
        "assets": []
      },
      {
        "address": "addr_test1qpfepft9zs3y8ejcv84tq6tkp00wdm46fr6h3am02leunk8dc55q34v2ggxw9hea4rr3rry933a2zdh60v43h237s8ks7t2dja",
        "hash": "25cd47bf49807f28c06835af9dd8984c15d48203dd1e875e5c26d95849876011",
        "index": 1,
        "value": 5000000,
        "has_script": false,
        "assets": []
      },
      {
        "address": "addr_test1qpfepft9zs3y8ejcv84tq6tkp00wdm46fr6h3am02leunk8dc55q34v2ggxw9hea4rr3rry933a2zdh60v43h237s8ks7t2dja",
        "hash": "25cd47bf49807f28c06835af9dd8984c15d48203dd1e875e5c26d95849876011",
        "index": 1,
        "value": 3000000,
        "has_script": false,
        "assets": []
      }
    ];

    const maxInputCount = 2;

    const error = `Maximum transaction inputs: ${maxInputCount} exceeded`;

    const payload: any = {
      "value": {
        "lovelace": 9000000
      },
      "max_input_count": maxInputCount
    };

    Utils.getAllUtxos = jest.fn().mockReturnValue(utxos);

    // act
    const response = service.coinSelection(address, payload);

    // assert
    await expect(response).rejects.toThrow(error);
  })

});