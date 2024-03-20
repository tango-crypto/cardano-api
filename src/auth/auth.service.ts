import { Injectable } from '@nestjs/common';
import { ApplicationService } from 'src/providers/account/application.service';

@Injectable()
export class AuthService {

    constructor(private applicationService: ApplicationService) { }

    async isValidApp(appId: string, userId: string): Promise<boolean> {
        const application = await this.applicationService.findOne(userId, appId);
        if (!application || !application.active) {
            return false;
        }
        // Do we need to check if user is active?
        return true;
    }
}