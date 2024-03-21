import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthService } from './auth.service';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private authService: AuthService, private reflector: Reflector) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (isPublic) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const { appId, userId } = this.extractAppCredentials(request);
        if (! appId || !userId) {
            throw new UnauthorizedException();
        }
        try {
            const { isValid, rateLimit } = await this.authService.isValidApp(appId, userId);
            if (!isValid) {
                throw new UnauthorizedException();
            }
            // 💡 We're assigning the payload to the request object here
            // so that we can access it in our route handlers
            request['user'] = { appId, userId, rateLimit };
        } catch {
            throw new UnauthorizedException();
        }
        return true;
    }

    private extractAppCredentials(request: Request): { appId: string, userId: string | undefined } {
        const [_ , appId] = request.url.split('/');
        const userId = request.headers['x-api-key'] as string;
        return { appId, userId };
    }
}