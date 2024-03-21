import { AutomapperProfile, InjectMapper } from "@automapper/nestjs";
import { Mapper, MappingProfile, createMap } from "@automapper/core";
import { Injectable } from "@nestjs/common";
import { RuleDto } from "../dto/rule.dto";
import { Rule } from "../models/rule.model";

@Injectable()
export class RuleProfile extends AutomapperProfile {
    constructor(@InjectMapper('mapper') mapper: Mapper) {
        super(mapper);
      }
      
    get profile(): MappingProfile {
        return (mapper: Mapper) => {
            createMap<Rule, RuleDto>(mapper, Rule, RuleDto);
            createMap<RuleDto, Rule>(mapper, RuleDto, Rule);
        }
    }

}