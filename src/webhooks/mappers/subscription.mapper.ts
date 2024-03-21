import { AutomapperProfile, InjectMapper } from "@automapper/nestjs";
import { Mapper, MappingProfile, createMap } from "@automapper/core";
import { Injectable } from "@nestjs/common";
import { SubscriptionDto } from "../dto/subscription.dto";
import { Subscription } from "../models/subscription.model";

@Injectable()
export class SubscriptionProfile extends AutomapperProfile {
    constructor(@InjectMapper('mapper') mapper: Mapper) {
        super(mapper);
      }
      
    get profile(): MappingProfile {
        return (mapper: Mapper) => {
            createMap<Subscription, SubscriptionDto>(mapper, Subscription, SubscriptionDto);
        }
    }

}