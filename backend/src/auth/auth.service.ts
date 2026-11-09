import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { AuthDto } from './dto/auth.dto';

const SALT_ROUNDS = 10;

@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwt: JwtService,
    ) {}

    async register(dto: AuthDto) {
        const exists = await this.prisma.user.findUnique({ where: { username: dto.username } });
        if (exists) throw new ConflictException('Username is already taken');
        const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);
        const user = await this.prisma.user.create({
            data: { username: dto.username, passwordHash },
        });
        return this.issueToken(user);
    }

    async login(dto: AuthDto) {
        const user = await this.prisma.user.findUnique({ where: { username: dto.username } });
        const valid = user && (await bcrypt.compare(dto.password, user.passwordHash));
        if (!user || !valid) throw new UnauthorizedException('Invalid username or password');
        return this.issueToken(user);
    }

    private async issueToken(user: { id: string; username: string }) {
        const accessToken = await this.jwt.signAsync({ sub: user.id, username: user.username });
        return { accessToken, user: { id: user.id, username: user.username } };
    }
}
