import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

export interface AuthUser {
    id: string;
    username: string;
}

export type AuthRequest = Request & { user: AuthUser };

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private readonly jwt: JwtService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req = context.switchToHttp().getRequest<AuthRequest>();
        const [scheme, token] = req.headers.authorization?.split(' ') ?? [];
        if (scheme !== 'Bearer' || !token) throw new UnauthorizedException();
        try {
            const payload = await this.jwt.verifyAsync<{ sub: string; username: string }>(token);
            req.user = { id: payload.sub, username: payload.username };
        } catch {
            throw new UnauthorizedException();
        }
        return true;
    }
}
