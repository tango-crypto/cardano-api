import { AutomapperProfile, InjectMapper } from "@automapper/nestjs";
import { Mapper, MappingProfile } from "@automapper/types";
import { Injectable } from "@nestjs/common";
import { SubscriptionDto } from "../dto/subscription.dto";
import { Subscription } from "../models/subscription.model";

@Injectable()
export class SubscriptionProfile extends AutomapperProfile {
    constructor(@InjectMapper('mapper') mapper: Mapper) {
        super(mapper);
      }
      
    mapProfile(): MappingProfile {
        return (mapper: Mapper) => {
            mapper.createMap(Subscription, SubscriptionDto);
        }
    }

}