import { AutomapperProfile, InjectMapper } from "@automapper/nestjs";
import { Mapper, MappingProfile, createMap, forMember, mapFrom } from "@automapper/core";
import { Injectable } from "@nestjs/common";
import { RuleDto } from "../dto/rule.dto";
import { Rule, ruleFieldTypes, valueToValue } from "../models/rule.model";

@Injectable()
export class RuleProfile extends AutomapperProfile {
    constructor(@InjectMapper('pojo-mapper') mapper: Mapper) {
        super(mapper);
      }
      
    get profile(): MappingProfile {
        return (mapper: Mapper) => {
            createMap<Rule, RuleDto>(mapper, 'Rule', 'RuleDto',
                forMember(dest => dest.field, mapFrom(src => src.field)),
                forMember(dest => dest.operator, mapFrom(src => src.operator)),
                forMember(dest => dest.value, mapFrom(src => valueToValue(src.field, src.value))),
            );
            createMap<RuleDto, Rule>(mapper, 'RuleDto', 'Rule',
                forMember(dest => dest.field, mapFrom(src => src.field)),
                forMember(dest => dest.operator, mapFrom(src => src.operator)),
                forMember(dest => dest.operator_type, mapFrom(src => ruleFieldTypes[src.field])),
                forMember(dest => dest.value, mapFrom(src => src.value.toString())),
            );
        }
    }

}