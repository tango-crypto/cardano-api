import { AutomapperProfile, InjectMapper } from "@automapper/nestjs";
import { Mapper, MappingProfile, createMap } from "@automapper/core";
import { Injectable } from "@nestjs/common";
import { ApplicationDto } from "../dto/application.dto";
import { Application } from "../models/application.model";

@Injectable()
export class ApplicationProfile extends AutomapperProfile {
    constructor(@InjectMapper('mapper') mapper: Mapper) {
        super(mapper);
      }
      
    get profile(): MappingProfile {
        return (mapper: Mapper) => {
            createMap<Application, ApplicationDto>(mapper, Application, ApplicationDto);
        }
    }

}