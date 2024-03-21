import { Injectable } from '@nestjs/common';
import { ApplicationService } from 'src/providers/account/application.service';

@Injectable()
export class AuthService {

    constructor(private applicationService: ApplicationService) { }

    async isValidApp(appId: string, userId: string): Promise<{isValid: boolean, rateLimit?: { limits: number, interval: number}}> {
        const application = await this.applicationService.findOne(userId, appId);
        if (!application || !application.active) {
            return { isValid:  false };
        }
        return { isValid: true, rateLimit: application.rate_limit };
    }
}