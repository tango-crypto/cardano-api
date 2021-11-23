import { AutomapperProfile, InjectMapper } from "@automapper/nestjs";
import { Mapper, MappingProfile } from "@automapper/types";
import { Injectable } from "@nestjs/common";
import { RuleDto } from "../dto/rule.dto";
import { Rule } from "../models/rule.model";

@Injectable()
export class RuleProfile extends AutomapperProfile {
    constructor(@InjectMapper() mapper: Mapper) {
        super(mapper);
      }
      
    mapProfile(): MappingProfile {
        return (mapper: Mapper) => {
            mapper.createMap(RuleDto, Rule);
            mapper.createMap(Rule, RuleDto);
        }
    }

}