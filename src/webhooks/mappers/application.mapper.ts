import { AutomapperProfile, InjectMapper } from "@automapper/nestjs";
import { Mapper, MappingProfile } from "@automapper/types";
import { Injectable } from "@nestjs/common";
import { ApplicationDto } from "../dto/application.dto";
import { Application } from "../models/application.model";

@Injectable()
export class ApplicationProfile extends AutomapperProfile {
    constructor(@InjectMapper('mapper') mapper: Mapper) {
        super(mapper);
      }
      
    mapProfile(): MappingProfile {
        return (mapper: Mapper) => {
            mapper.createMap(Application, ApplicationDto);
        }
    }

}