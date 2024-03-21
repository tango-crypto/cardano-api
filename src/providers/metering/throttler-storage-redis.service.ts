import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ThrottlerStorage } from '@nestjs/throttler';
import { ThrottlerStorageRecord } from '@nestjs/throttler/dist/throttler-storage-record.interface';
import Redis, { Cluster, RedisOptions, ClusterOptions, ClusterNode } from 'ioredis';

@Injectable()
export class ThrottlerStorageRedisService implements ThrottlerStorage, OnModuleDestroy {
    scriptSrc: string;
    redis: Redis | Cluster;

    constructor(private readonly configService: ConfigService) {
        const config: { options: ClusterOptions | RedisOptions, nodes?: ClusterNode[] } = this.configService.get<string>('NODE_ENV') == 'development' ? {
            options: {
                host: this.configService.get<string>('REDIS_HOST'),
                port: this.configService.get<number>('REDIS_PORT')
            }
        } : {
            options: {
                redisOptions: {
                    password: this.configService.get<string>('REDIS_PWD'),
                }
            },
            nodes: JSON.parse(configService.get<string>('REDIS_CLUSTERS'))
        };
        this.redis = config.nodes ? new Cluster(config.nodes, config.options) : new Redis(config.options);
        this.scriptSrc = this.getScriptSrc();
    }

    getScriptSrc(): string {
        // Credits to wyattjoh for the fast implementation you see below.
        // https://github.com/express-rate-limit/rate-limit-redis/blob/main/source/scripts.ts
        return `
            local totalHits = redis.call("INCR", KEYS[1])
            local timeToExpire = redis.call("PTTL", KEYS[1])
            if timeToExpire <= 0
                then
                redis.call("PEXPIRE", KEYS[1], tonumber(ARGV[1]))
                timeToExpire = tonumber(ARGV[1])
                end
            return { totalHits, timeToExpire }
            `
            // Ensure that code changes that affect whitespace do not affect
            // the script contents.
            .replace(/^\s+/gm, '')
            .trim();
    }

    async increment(key: string, ttl: number): Promise<ThrottlerStorageRecord> {
        // Use EVAL instead of EVALSHA to support both redis instances and clusters.
        const results: number[] = (await this.redis.call(
            'EVAL',
            this.scriptSrc,
            1,
            key,
            ttl,
        )) as number[];

        if (!Array.isArray(results)) {
            throw new TypeError(`Expected result to be array of values, got ${results}`);
        }

        if (results.length !== 2) {
            throw new Error(`Expected 2 values, got ${results.length}`);
        }

        const [totalHits, timeToExpire] = results;

        if (typeof totalHits !== 'number') {
            throw new TypeError('Expected totalHits to be a number');
        }

        if (typeof timeToExpire !== 'number') {
            throw new TypeError('Expected timeToExpire to be a number');
        }

        return { totalHits, timeToExpire };
    }

    onModuleDestroy() {
        this.redis?.disconnect(false);
    }
}