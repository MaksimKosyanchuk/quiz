'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { quizApi } from '@/services/api';
import type { Question, Quiz } from '@/types/quiz';
import styles from './QuizDetail.module.scss';

function QuestionView({ question, index }: { question: Question; index: number }) {
    return (
        <div className={`card ${styles.question}`}>
            <span className={styles.type}>{question.type.toLowerCase()}</span>
            <p className={styles.text}>
                {index + 1}. {question.text}
            </p>
            {question.type === 'BOOLEAN' && (
                <div className={styles.options}>
                    {[true, false].map((value) => (
                        <label key={String(value)}>
                            <input
                                type="radio"
                                readOnly
                                disabled
                                checked={question.booleanAnswer === value}
                            />
                            {value ? 'True' : 'False'}
                        </label>
                    ))}
                </div>
            )}
            {question.type === 'INPUT' && (
                <input className="input" readOnly disabled value={question.textAnswer ?? ''} />
            )}
            {question.type === 'CHECKBOX' && (
                <div className={styles.options}>
                    {question.options?.map((option, i) => (
                        <label key={i}>
                            <input type="checkbox" readOnly disabled checked={!!option.isCorrect} />
                            {option.text}
                        </label>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function QuizDetail({ id }: { id: string }) {
    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        quizApi
            .get(id)
            .then(setQuiz)
            .catch((e: Error) => setError(e.message));
    }, [id]);

    if (error) return <p className="error">{error}</p>;
    if (!quiz) return <p className="muted">Loading...</p>;

    return (
        <>
            <Link href="/quizzes" className="muted">
                ← Back to quizzes
            </Link>
            <h1>{quiz.title}</h1>
            <Link href={`/quizzes/${quiz.id}/take`} className="btn btn--primary">
                Take quiz
            </Link>
            {quiz.questions.map((question, i) => (
                <QuestionView key={question.id} question={question} index={i} />
            ))}
        </>
    );
}
