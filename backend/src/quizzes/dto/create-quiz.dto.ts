import { Type } from 'class-transformer';
import {
    ArrayMinSize,
    IsArray,
    IsBoolean,
    IsEnum,
    IsNotEmpty,
    IsString,
    MaxLength,
    ValidateIf,
    ValidateNested,
} from 'class-validator';

export enum QuestionType {
    BOOLEAN = 'BOOLEAN',
    INPUT = 'INPUT',
    CHECKBOX = 'CHECKBOX',
}

export class OptionDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(200)
    text: string;

    @IsBoolean()
    isCorrect: boolean;
}

export class QuestionDto {
    @IsEnum(QuestionType)
    type: QuestionType;

    @IsString()
    @IsNotEmpty()
    @MaxLength(500)
    text: string;

    @ValidateIf((q: QuestionDto) => q.type === QuestionType.BOOLEAN)
    @IsBoolean()
    booleanAnswer?: boolean;

    @ValidateIf((q: QuestionDto) => q.type === QuestionType.INPUT)
    @IsString()
    @IsNotEmpty()
    @MaxLength(500)
    textAnswer?: string;

    @ValidateIf((q: QuestionDto) => q.type === QuestionType.CHECKBOX)
    @IsArray()
    @ArrayMinSize(2)
    @ValidateNested({ each: true })
    @Type(() => OptionDto)
    options?: OptionDto[];
}

export class CreateQuizDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(200)
    title: string;

    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => QuestionDto)
    questions: QuestionDto[];
}
