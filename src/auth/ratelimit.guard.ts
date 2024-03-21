import { ExecutionContext, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Reflector } from "@nestjs/core";
import { InjectThrottlerOptions, InjectThrottlerStorage, ThrottlerGuard, ThrottlerModuleOptions, ThrottlerOptions, ThrottlerStorage } from "@nestjs/throttler";

@Injectable()
export class ApiThrottlerGuard extends ThrottlerGuard {
    prefix: string;

    constructor(@InjectThrottlerOptions() protected readonly options: ThrottlerModuleOptions,
    @InjectThrottlerStorage() protected readonly storageService: ThrottlerStorage,
    protected readonly reflector: Reflector, private config: ConfigService) {
        super(options, storageService, reflector);
        
        this.prefix = this.config.get<string>('THROTTLE_PREFIX') || 'account-ratelimit-';
        const errorMessage = this.config.get<string>('THROTTLE_ERROR_MESSAGE');
        if (!this.prefix.endsWith('-')) this.prefix += '-';
        if (errorMessage) {
            this.errorMessage = errorMessage;
        }
    }
  
    async handleRequest(context: ExecutionContext, _limit: number, _ttl: number, throttler: ThrottlerOptions): Promise<boolean> {
        const { req, res } = this.getRequestResponse(context);

        const { userId, rateLimit } = req['user'];
        
        const { limits: limit, interval: ttl } = rateLimit || { limits: _limit, interval: _ttl };
        const tracker = await this.getTracker(req);
        const key = `${this.prefix}{${userId}}`;
        
        const { totalHits, timeToExpire } = await this.storageService.increment(key, ttl);
        
        if (totalHits > limit) {
            res.header(`Retry-After`, timeToExpire);
            await this.throwThrottlingException(context, {
                limit,
                ttl,
                key,
                tracker,
                totalHits,
                timeToExpire,
              });
        }
    
        return true;
      }
}
