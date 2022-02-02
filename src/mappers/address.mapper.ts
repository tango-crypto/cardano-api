import { mapFrom } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import type { Mapper } from '@automapper/types';
import { Injectable } from '@nestjs/common';
import {  Address } from '@tango-crypto/tango-ledger';
import { AddressDto } from 'src/models/dto/Address.dto';

@Injectable()
export class AddressProfile extends AutomapperProfile {
  constructor(@InjectMapper('pojo-mapper') mapper: Mapper) {
    super(mapper);
  }

  mapProfile() {
    return (mapper: Mapper) => {
      mapper.createMap<Address, AddressDto>('Address', 'AddressDto')
      .forMember(dest => dest.address, mapFrom(src => src.address))
      ;
    }
  }
}