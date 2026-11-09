import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Question } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateQuizDto, OptionDto, QuestionType } from './dto/create-quiz.dto';
import { AnswerDto, SubmitAttemptDto } from './dto/submit-attempt.dto';

const questionsInclude = { questions: { orderBy: { position: 'asc' } } } as const;

@Injectable()
export class QuizzesService {
    constructor(private readonly prisma: PrismaService) {}

    create(userId: string, dto: CreateQuizDto) {
        return this.prisma.quiz.create({
            data: {
                title: dto.title,
                authorId: userId,
                questions: {
                    create: dto.questions.map((q, position) => ({
                        position,
                        type: q.type,
                        text: q.text,
                        booleanAnswer: q.type === QuestionType.BOOLEAN ? q.booleanAnswer : null,
                        textAnswer: q.type === QuestionType.INPUT ? q.textAnswer : null,
                        options:
                            q.type === QuestionType.CHECKBOX
                                ? (q.options as unknown as Prisma.InputJsonValue)
                                : Prisma.JsonNull,
                    })),
                },
            },
            include: questionsInclude,
        });
    }

    async findAll(userId: string) {
        const quizzes = await this.prisma.quiz.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                _count: { select: { questions: true } },
                attempts: { where: { userId }, orderBy: { createdAt: 'desc' }, take: 1 },
            },
        });
        return quizzes.map(({ id, title, createdAt, authorId, _count, attempts }) => {
            const last = attempts[0];
            return {
                id,
                title,
                createdAt,
                questionsCount: _count.questions,
                isOwner: authorId === userId,
                completed: !!last,
                lastAttempt: last
                    ? { score: last.score, total: last.total, createdAt: last.createdAt }
                    : null,
            };
        });
    }

    async findOne(userId: string, id: string) {
        const quiz = await this.prisma.quiz.findUnique({
            where: { id },
            include: questionsInclude,
        });
        if (!quiz) throw new NotFoundException(`Quiz ${id} not found`);
        const isOwner = quiz.authorId === userId;
        // Correct answers are only visible to the author
        const questions = isOwner
            ? quiz.questions
            : quiz.questions.map((q) => ({
                  ...q,
                  booleanAnswer: null,
                  textAnswer: null,
                  options: this.readOptions(q)?.map(({ text }) => ({ text })) ?? null,
              }));
        return { ...quiz, isOwner, questions };
    }

    async remove(userId: string, id: string) {
        const quiz = await this.prisma.quiz.findUnique({ where: { id } });
        if (!quiz) throw new NotFoundException(`Quiz ${id} not found`);
        if (quiz.authorId !== userId)
            throw new ForbiddenException('Only the author can delete a quiz');
        await this.prisma.quiz.delete({ where: { id } });
    }

    async submitAttempt(userId: string, id: string, dto: SubmitAttemptDto) {
        const quiz = await this.prisma.quiz.findUnique({
            where: { id },
            include: questionsInclude,
        });
        if (!quiz) throw new NotFoundException(`Quiz ${id} not found`);

        const answers = new Map(dto.answers.map((a) => [a.questionId, a]));
        const results = quiz.questions.map((q) => ({
            questionId: q.id,
            correct: this.isCorrect(q, answers.get(q.id)),
        }));
        const score = results.filter((r) => r.correct).length;

        const attempt = await this.prisma.attempt.create({
            data: { userId, quizId: id, score, total: results.length },
        });
        return { id: attempt.id, score, total: results.length, results };
    }

    private readOptions(q: Question): OptionDto[] | null {
        return Array.isArray(q.options) ? (q.options as unknown as OptionDto[]) : null;
    }

    private isCorrect(q: Question, answer?: AnswerDto): boolean {
        if (!answer) return false;
        switch (q.type) {
            case QuestionType.BOOLEAN:
                return answer.booleanAnswer === q.booleanAnswer;
            case QuestionType.INPUT:
                return (
                    answer.textAnswer !== undefined &&
                    answer.textAnswer.trim().toLowerCase() ===
                        (q.textAnswer ?? '').trim().toLowerCase()
                );
            case QuestionType.CHECKBOX: {
                const options = this.readOptions(q) ?? [];
                const correct = options.flatMap((o, i) => (o.isCorrect ? [i] : []));
                const selected = [...new Set(answer.selectedOptions ?? [])];
                return (
                    selected.length === correct.length && selected.every((i) => correct.includes(i))
                );
            }
            default:
                return false;
        }
    }
}
