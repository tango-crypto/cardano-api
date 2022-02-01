import { mapFrom } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import type { Mapper } from '@automapper/types';
import { Injectable } from '@nestjs/common';
import {  Metadata } from '@tango-crypto/tango-ledger';
import { MetadataDto } from 'src/models/dto/Metadata.dto';

@Injectable()
export class MetadataProfile extends AutomapperProfile {
  constructor(@InjectMapper('pojo-mapper') mapper: Mapper) {
    super(mapper);
  }

  mapProfile() {
    return (mapper: Mapper) => {
      mapper.createMap<Metadata, MetadataDto>('Metadata', 'MetadataDto')
      .forMember(dest => dest.label, mapFrom(src => src.label))
      .forMember(dest => dest.json, mapFrom(src => src.json))
      ;
    }
  }
}