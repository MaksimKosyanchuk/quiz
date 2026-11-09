import { Transform } from 'class-transformer';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class AuthDto {
    @Transform(({ value }: { value: unknown }) =>
        typeof value === 'string' ? value.trim() : value,
    )
    @IsString()
    @MinLength(3)
    @MaxLength(30)
    username: string;

    // bcrypt only uses the first 72 bytes
    @IsString()
    @MinLength(6)
    @MaxLength(72)
    password: string;
}
