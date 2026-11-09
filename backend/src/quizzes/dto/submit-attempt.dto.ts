import { Type } from 'class-transformer';
import {
    IsArray,
    IsBoolean,
    IsInt,
    IsOptional,
    IsString,
    IsUUID,
    MaxLength,
    Min,
    ValidateNested,
} from 'class-validator';

export class AnswerDto {
    @IsUUID()
    questionId: string;

    @IsOptional()
    @IsBoolean()
    booleanAnswer?: boolean;

    @IsOptional()
    @IsString()
    @MaxLength(500)
    textAnswer?: string;

    @IsOptional()
    @IsArray()
    @IsInt({ each: true })
    @Min(0, { each: true })
    selectedOptions?: number[];
}

export class SubmitAttemptDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => AnswerDto)
    answers: AnswerDto[];
}
