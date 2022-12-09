import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Metering } from '@tango-crypto/notify-metering';
import Redis from 'ioredis';
import { TIER_1, TIER_2 } from 'src/utils/constants';

@Injectable()
export class MeteringService {
    client: Metering;

    constructor(private readonly configService: ConfigService) {
        const config: { options: Redis.ClusterOptions | Redis.RedisOptions, nodes?: Redis.ClusterNode[] } = this.configService.get<string>('NODE_ENV') == 'development' ? {
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

    async getNftFee(accountId: string): Promise<{ fee: number, token_name: string }> {
        let fee: number;
        const { tier, nft_free_quota, nft_fees, nft_minted, token_name } = await this.client.getNftQuota(accountId);
        console.log('QUOTA:', tier, nft_free_quota, nft_fees, nft_minted, token_name);
        if (tier == 'enterprise' || nft_free_quota > nft_minted) {
            fee = 0;
        } else {
            fee = nft_fees[this.getTier(nft_minted)];
        }
        return { fee, token_name };
    }

    async getServer(network: string, port: number): Promise<string> {
        const max = await this.client.getMempoolMaxCapacity(network, 0);
        const host = max ? `http://${max['id']}:${port}` : '';
        console.log(`Ogmios server host: ${host}`);
        return host;
    }

    private getTier(nftMinted: number): string {
        return nftMinted <= TIER_1 ? 'tier1' : nftMinted <= TIER_2 ? 'tier2' : 'tier3';
    }
}
