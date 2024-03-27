import { createMap, forMember, mapFrom } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import type { Mapper } from '@automapper/core';
import { Injectable } from '@nestjs/common';
import { Metadata } from '@tangocrypto/tango-ledger';
import { MetadataDto } from 'src/models/dto/Metadata.dto';

@Injectable()
export class MetadataProfile extends AutomapperProfile {
  constructor(@InjectMapper('pojo-mapper') mapper: Mapper) {
    super(mapper);
  }

  get profile() {
    return (mapper: Mapper) => {
      createMap<Metadata, MetadataDto>(mapper, 'Metadata', 'MetadataDto',
        forMember(dest => dest.label, mapFrom(src => src.label)),
        forMember(dest => dest.json, mapFrom(src => src.json)),
      );
    }
  }
}