import { AutomapperProfile, InjectMapper } from "@automapper/nestjs";
import { Mapper, MappingProfile, createMap } from "@automapper/core";
import { Injectable } from "@nestjs/common";
import { AccountDto } from "../dto/account.dto";
import { Account } from "../models/account.model";

@Injectable()
export class AccountProfile extends AutomapperProfile {
    constructor(@InjectMapper('mapper') mapper: Mapper) {
        super(mapper);
      }
      
    get profile(): MappingProfile {
        return (mapper: Mapper) => {
            createMap<Account, AccountDto>(mapper, Account, AccountDto);
        }
    }

}