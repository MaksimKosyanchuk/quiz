import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    Param,
    ParseUUIDPipe,
    Post,
    UseGuards,
} from '@nestjs/common';
import { AuthGuard, AuthUser } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { SubmitAttemptDto } from './dto/submit-attempt.dto';
import { QuizzesService } from './quizzes.service';

@Controller('quizzes')
@UseGuards(AuthGuard)
export class QuizzesController {
    constructor(private readonly quizzesService: QuizzesService) {}

    @Post()
    create(@CurrentUser() user: AuthUser, @Body() dto: CreateQuizDto) {
        return this.quizzesService.create(user.id, dto);
    }

    @Get()
    findAll(@CurrentUser() user: AuthUser) {
        return this.quizzesService.findAll(user.id);
    }

    @Get(':id')
    findOne(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string) {
        return this.quizzesService.findOne(user.id, id);
    }

    @Post(':id/attempts')
    submitAttempt(
        @CurrentUser() user: AuthUser,
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: SubmitAttemptDto,
    ) {
        return this.quizzesService.submitAttempt(user.id, id, dto);
    }

    @Delete(':id')
    @HttpCode(204)
    remove(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string) {
        return this.quizzesService.remove(user.id, id);
    }
}
