import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { mapping } from "cassandra-driver";
import { Application } from "src/webhooks/models/application.model";
import { ScyllaService } from "../scylla/scylla.service";

@Injectable()
export class ApplicationService {
    table: string;
    applicationMapper: mapping.ModelMapper<Application>;

    constructor(private readonly configService: ConfigService, private scyllaService: ScyllaService) { 
        const mappingOptions: mapping.MappingOptions = {
            models: {
                'Application': {
                    tables: ['applications'],
                    mappings: new mapping.DefaultTableMappings
                },
            }
        }

        this.applicationMapper = this.scyllaService.createMapper(mappingOptions).forModel('Application');
    }


    async findOne(userId: string, appId: string): Promise<Application> {
        const result = await this.applicationMapper.find({ user_id: userId, app_id: appId });
        return result.first();
    }

    async findAll(userId: string): Promise<Application[]> {
        const result = await this.applicationMapper.find({ user_id: userId });
        return result.toArray();
    }
}