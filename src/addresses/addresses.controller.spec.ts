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

describe('AddressesController', () => {
  let controller: AddressesController;

  const config = {
    "DB_HOST": "db",
    "DB_PORT": 5432,
    "DB_NAME": "testnet_preprod",
    "DB_USER": "db_user",
    "DB_PWD":"0p9o8i",
    "DB_DEBUG": false,
    "AWS_REGION": "us-east-1",
    "NETWORK": "testnet",
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
    const module: TestingModule = await Test.createTestingModule({
      imports: [AutomapperModule],
      controllers: [AddressesController],
      providers: [
        {
          provide: getMapperToken('pojo-mapper'),
          useValue: createMapper(
            {name: 'pojo-mapper', pluginInitializer: pojos}
          ),
        }, 
        AddressesService, 
        TangoLedgerService, 
        configService,
        UtxoProfile, 
        ValueProfile],
    }).compile();

    controller = module.get<AddressesController>(AddressesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
