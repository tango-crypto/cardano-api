import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Metering } from '@tango-crypto/notify-metering';
import Redis from 'ioredis';

@Injectable()
export class MeteringService {
    client: Metering;

    constructor(private readonly configService: ConfigService) {
        const config: { options: Redis.ClusterOptions | Redis.RedisOptions, nodes?: Redis.ClusterNode[]} = this.configService.get<string>('NODE_ENV') == 'development' ? { 
            options: {
                host: this.configService.get<string>('REDIS_HOST'),
                port: this.configService.get<number>('REDIS_PORT')
            }
        } : {
            options: {
                redisOptions: {
                    showFriendlyErrorStack: true,
                    password: this.configService.get<string>('REDIS_PWD'),
                }
            },
            nodes: JSON.parse(configService.get<string>('REDIS_CLUSTERS'))
        };
        this.client = new Metering(config);
    }

    async removeWebhookFails(account: string, wbhId: string): Promise<boolean> {
        return this.client.resetWebhookFails(account, wbhId);
    }
}
