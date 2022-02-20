import { AutomapperProfile, InjectMapper } from "@automapper/nestjs";
import { Mapper, MappingProfile } from "@automapper/types";
import { Injectable } from "@nestjs/common";
import { AccountDto } from "../dto/account.dto";
import { Account } from "../models/account.model";

@Injectable()
export class AccountProfile extends AutomapperProfile {
    constructor(@InjectMapper('mapper') mapper: Mapper) {
        super(mapper);
      }
      
    mapProfile(): MappingProfile {
        return (mapper: Mapper) => {
            mapper.createMap(Account, AccountDto);
        }
    }

}