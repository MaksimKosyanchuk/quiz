'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { quizApi } from '@/services/api';
import type { Answer, AttemptResult, Quiz } from '@/types/quiz';
import Button from './Button';
import styles from './QuizTake.module.scss';

type Answers = Record<string, Answer>;

export default function QuizTake({ id }: { id: string }) {
    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [answers, setAnswers] = useState<Answers>({});
    const [result, setResult] = useState<AttemptResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        quizApi
            .get(id)
            .then(setQuiz)
            .catch((e: Error) => setError(e.message));
    }, [id]);

    function setAnswer(questionId: string, patch: Partial<Answer>) {
        setAnswers((prev) => ({
            ...prev,
            [questionId]: { ...prev[questionId], questionId, ...patch },
        }));
    }

    function toggleOption(questionId: string, index: number) {
        const current = answers[questionId]?.selectedOptions ?? [];
        const next = current.includes(index)
            ? current.filter((i) => i !== index)
            : [...current, index];
        setAnswer(questionId, { selectedOptions: next });
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        try {
            setResult(await quizApi.submitAttempt(id, Object.values(answers)));
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setSubmitting(false);
        }
    }

    function retake() {
        setAnswers({});
        setResult(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    if (!quiz)
        return error ? <p className="error">{error}</p> : <p className="muted">Loading...</p>;

    const allAnswered = quiz.questions.every((q) => {
        const a = answers[q.id];
        if (q.type === 'BOOLEAN') return a?.booleanAnswer !== undefined;
        if (q.type === 'INPUT') return !!a?.textAnswer?.trim();
        return (a?.selectedOptions?.length ?? 0) > 0;
    });

    const verdicts = new Map(result?.results.map((r) => [r.questionId, r.correct]));

    return (
        <form onSubmit={handleSubmit}>
            <Link href="/quizzes" className="muted">
                ← Back to quizzes
            </Link>
            <h1>{quiz.title}</h1>

            {result && (
                <div className={`card ${styles.score}`}>
                    <strong>
                        {result.score} / {result.total}
                    </strong>
                    <span className="muted">Your result</span>
                    <div className={styles.actions} style={{ justifyContent: 'center' }}>
                        <button type="button" className="btn btn--primary" onClick={retake}>
                            Retake
                        </button>
                        <Link href="/quizzes" className="btn">
                            All quizzes
                        </Link>
                    </div>
                </div>
            )}

            {quiz.questions.map((q, i) => {
                const answer = answers[q.id];
                const verdict = verdicts.get(q.id);
                const state = result ? (verdict ? styles.correct : styles.wrong) : '';
                return (
                    <fieldset
                        key={q.id}
                        disabled={!!result}
                        className={`card ${styles.question} ${state}`}
                    >
                        <p className={styles.text}>
                            {i + 1}. {q.text}
                        </p>

                        {q.type === 'BOOLEAN' && (
                            <div className={styles.options}>
                                {[true, false].map((value) => (
                                    <label key={String(value)}>
                                        <input
                                            type="radio"
                                            name={q.id}
                                            checked={answer?.booleanAnswer === value}
                                            onChange={() =>
                                                setAnswer(q.id, { booleanAnswer: value })
                                            }
                                        />
                                        {value ? 'True' : 'False'}
                                    </label>
                                ))}
                            </div>
                        )}

                        {q.type === 'INPUT' && (
                            <input
                                className="input"
                                value={answer?.textAnswer ?? ''}
                                onChange={(e) => setAnswer(q.id, { textAnswer: e.target.value })}
                            />
                        )}

                        {q.type === 'CHECKBOX' && (
                            <div className={styles.options}>
                                {q.options?.map((option, idx) => (
                                    <label key={idx}>
                                        <input
                                            type="checkbox"
                                            checked={
                                                answer?.selectedOptions?.includes(idx) ?? false
                                            }
                                            onChange={() => toggleOption(q.id, idx)}
                                        />
                                        {option.text}
                                    </label>
                                ))}
                            </div>
                        )}

                        {result && (
                            <p className={styles.verdict}>
                                {verdict ? '✓ Correct' : '✗ Incorrect'}
                            </p>
                        )}
                    </fieldset>
                );
            })}

            {error && <p className="error">{error}</p>}
            {!result && (
                <div className={styles.actions}>
                    <Button type="submit" disabled={!allAnswered || submitting}>
                        {submitting ? 'Checking...' : 'Submit answers'}
                    </Button>
                </div>
            )}
        </form>
    );
}
