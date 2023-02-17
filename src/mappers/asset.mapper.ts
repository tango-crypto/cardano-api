import { fromValue, ignore, mapDefer, mapFrom } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import type { Mapper } from '@automapper/types';
import { Injectable } from '@nestjs/common';
import { Asset, AssetOwner, Metadata } from '@tango-crypto/tango-ledger';
import { AssetDto } from 'src/models/dto/Asset.dto';
import { AssetOwnerDto } from 'src/models/dto/AssetOwner.dto';
import { MetadataDto } from 'src/models/dto/Metadata.dto';

@Injectable()
export class AssetProfile extends AutomapperProfile {
  constructor(@InjectMapper('pojo-mapper') mapper: Mapper) {
    super(mapper);
  }

  mapProfile() {
    return (mapper: Mapper) => {
      mapper.createMap<Asset, AssetDto>('Asset', 'AssetDto')
      .forMember(dest => dest.policy_id, mapFrom(src => src.policy_id))
      .forMember(dest => dest.asset_name, mapFrom(src => src.asset_name))
      .forMember(dest => dest.asset_name_label, mapFrom(src => src.asset_name_label))
      .forMember(dest => dest.fingerprint, mapFrom(src => src.fingerprint))
      .forMember(dest => dest.quantity, mapFrom(src => Number(src.quantity)))
      .forMember(dest => dest.mint_transactions, mapDefer<Asset>(src => src.mint_transactions ? fromValue(Number(src.mint_transactions)) : ignore()))
      .forMember(dest => dest.created_at, mapDefer<Asset>(src => src.created_at ? fromValue(src.created_at) : ignore()))
      .forMember(dest => dest.mint_quantity, mapDefer<Asset>(src => src.mint_quantity ? fromValue(Number(src.mint_quantity)) : ignore()))
      .forMember(dest => dest.burn_quantity, mapDefer<Asset>(src => src.burn_quantity ? fromValue(Number(src.burn_quantity)) : ignore()))
      .forMember(dest => dest.mint_or_burn_quantity, mapDefer<Asset>(src => src.mint_or_burn_quantity ? fromValue(Number(src.mint_or_burn_quantity)) : ignore()))
      .forMember(dest => dest.initial_mint_tx_hash, mapFrom(src => src.initial_mint_tx_hash))
      .forMember(dest => dest.on_chain_metadata, ignore())
      .forMember(dest => dest.metadata, mapDefer<Asset>(src => src.metadata ? fromValue(mapper.mapArray<Metadata, MetadataDto>(src.metadata, 'MetadataDto', 'Metadata')) : ignore()))
      ;

      mapper.createMap<AssetOwner, AssetOwnerDto>('AssetOwner', 'AssetOwnerDto')
      .forMember(dest => dest.address, mapFrom(src => src.address))
      .forMember(dest => dest.quantity, mapFrom(src => Number(src.quantity)))
      .forMember(dest => dest.share, mapFrom(src => Number(src.share)))
      ;
    } 
  }
}