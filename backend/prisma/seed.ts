import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const author = await prisma.user.upsert({
        where: { username: 'demo' },
        update: {},
        create: { username: 'demo', passwordHash: await bcrypt.hash('demo1234', 10) },
    });

    await prisma.quiz.create({
        data: {
            title: 'JavaScript basics',
            authorId: author.id,
            questions: {
                create: [
                    {
                        position: 0,
                        type: 'BOOLEAN',
                        text: 'JavaScript is a statically typed language',
                        booleanAnswer: false,
                    },
                    {
                        position: 1,
                        type: 'INPUT',
                        text: 'Which keyword declares a block-scoped constant?',
                        textAnswer: 'const',
                    },
                    {
                        position: 2,
                        type: 'CHECKBOX',
                        text: 'Which of these are primitive types?',
                        options: [
                            { text: 'string', isCorrect: true },
                            { text: 'object', isCorrect: false },
                            { text: 'number', isCorrect: true },
                            { text: 'array', isCorrect: false },
                        ],
                    },
                ],
            },
        },
    });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
