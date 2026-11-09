'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { quizApi } from '@/services/api';
import type { QuizSummary } from '@/types/quiz';
import ConfirmModal from './ConfirmModal';
import styles from './QuizList.module.scss';

export default function QuizList() {
    const [quizzes, setQuizzes] = useState<QuizSummary[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [quizToDelete, setQuizToDelete] = useState<QuizSummary | null>(null);
    const [deleting, setDeleting] = useState(false);
    const closeModal = useCallback(() => setQuizToDelete(null), []);

    useEffect(() => {
        quizApi
            .list()
            .then(setQuizzes)
            .catch((e: Error) => setError(e.message));
    }, []);

    async function confirmDelete() {
        if (!quizToDelete) return;
        setDeleting(true);
        try {
            await quizApi.remove(quizToDelete.id);
            setQuizzes((prev) => prev?.filter((q) => q.id !== quizToDelete.id) ?? null);
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setDeleting(false);
            setQuizToDelete(null);
        }
    }

    return (
        <>
            <div className={styles.head}>
                <h1>Quizzes</h1>
                <Link href="/create" className="btn btn--primary">
                    + New quiz
                </Link>
            </div>
            {error && <p className="error">{error}</p>}
            {!quizzes && !error && <p className="muted">Loading...</p>}
            {quizzes?.length === 0 && (
                <p className="muted">No quizzes yet. Create your first one.</p>
            )}
            <ul className={styles.list}>
                {quizzes?.map((quiz) => (
                    <li key={quiz.id} className={`card ${styles.item}`}>
                        <Link href={`/quizzes/${quiz.id}`} className={styles.link}>
                            <h2 className={styles.title}>{quiz.title}</h2>
                            <span className="muted">
                                {quiz.questionsCount}{' '}
                                {quiz.questionsCount === 1 ? 'question' : 'questions'}
                            </span>
                            {quiz.lastAttempt && (
                                <span className={styles.badge}>
                                    Completed: {quiz.lastAttempt.score}/{quiz.lastAttempt.total}
                                </span>
                            )}
                        </Link>
                        <div className={styles.actions}>
                            <Link href={`/quizzes/${quiz.id}/take`} className="btn btn--primary">
                                {quiz.completed ? 'Retake' : 'Take'}
                            </Link>
                            {quiz.isOwner && (
                                <button
                                    type="button"
                                    className={styles.delete}
                                    aria-label={`Delete ${quiz.title}`}
                                    onClick={() => setQuizToDelete(quiz)}
                                >
                                    Delete
                                </button>
                            )}
                        </div>
                    </li>
                ))}
            </ul>
            {quizToDelete && (
                <ConfirmModal
                    title="Delete quiz?"
                    message={`"${quizToDelete.title}" and all its questions will be deleted. This cannot be undone.`}
                    loading={deleting}
                    onConfirm={confirmDelete}
                    onCancel={closeModal}
                />
            )}
        </>
    );
}
