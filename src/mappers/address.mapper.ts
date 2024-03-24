import { createMap, forMember, fromValue, ignore, mapDefer, mapFrom } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import type { Mapper } from '@automapper/core';
import { Injectable } from '@nestjs/common';
import { Address } from '@tango-crypto/tango-ledger';
import { AddressDto } from 'src/models/dto/Address.dto';

@Injectable()
export class AddressProfile extends AutomapperProfile {
  constructor(@InjectMapper('pojo-mapper') mapper: Mapper) {
    super(mapper);
  }

  get profile() {
    return (mapper: Mapper) => {
      createMap<Address, AddressDto>(mapper, 'Address', 'AddressDto',
        forMember(dest => dest.address, mapFrom(src => src.address)),
        // forMember(dest => dest.quantity, mapDefer(src => src.quantity ? mapFrom(src => Number(src.quantity)) : ignore())),
      )
    }
  }
}